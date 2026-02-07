import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/service";

// ── Token Encryption (AES-256-GCM) ──

const ENCRYPTION_KEY = Buffer.from(
  process.env.DROPBOX_TOKEN_ENCRYPTION_KEY || "",
  "hex"
);

export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  // Store as iv:tag:encrypted (all hex)
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptToken(encryptedToken: string): string {
  const [ivHex, tagHex, dataHex] = encryptedToken.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(dataHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted) + decipher.final("utf8");
}

// ── OAuth Helpers ──

const DROPBOX_APP_KEY = process.env.DROPBOX_APP_KEY!;
const DROPBOX_APP_SECRET = process.env.DROPBOX_APP_SECRET!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/dropbox/callback`;

export function getAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: DROPBOX_APP_KEY,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    token_access_type: "offline",
    state,
  });
  return `https://www.dropbox.com/oauth2/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const res = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      client_id: DROPBOX_APP_KEY,
      client_secret: DROPBOX_APP_SECRET,
      redirect_uri: REDIRECT_URI,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dropbox token exchange failed: ${text}`);
  }
  return res.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    account_id: string;
  }>;
}

export async function refreshAccessToken(encryptedRefreshToken: string) {
  const refreshToken = decryptToken(encryptedRefreshToken);
  const res = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      client_id: DROPBOX_APP_KEY,
      client_secret: DROPBOX_APP_SECRET,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dropbox token refresh failed: ${text}`);
  }
  return res.json() as Promise<{
    access_token: string;
    expires_in: number;
  }>;
}

// ── Token Refresh Wrapper ──

interface DropboxConnection {
  id: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  token_expires_at: string;
}

export async function getValidAccessToken(
  connection: DropboxConnection
): Promise<string> {
  const expiresAt = new Date(connection.token_expires_at);
  const fiveMinFromNow = new Date(Date.now() + 5 * 60 * 1000);

  if (expiresAt > fiveMinFromNow) {
    return decryptToken(connection.access_token_encrypted);
  }

  // Token expired or expiring soon — refresh
  const result = await refreshAccessToken(connection.refresh_token_encrypted);
  const newEncryptedAccess = encryptToken(result.access_token);
  const newExpiry = new Date(
    Date.now() + result.expires_in * 1000
  ).toISOString();

  // Update DB
  const serviceClient = createServiceClient();
  await serviceClient
    .from("dropbox_connections")
    .update({
      access_token_encrypted: newEncryptedAccess,
      token_expires_at: newExpiry,
    })
    .eq("id", connection.id);

  return result.access_token;
}

// ── Dropbox API Wrappers ──

interface DropboxEntry {
  ".tag": "file" | "folder";
  name: string;
  path_lower: string;
  path_display: string;
  id: string;
  size?: number;
  server_modified?: string;
}

export async function listFolder(
  accessToken: string,
  path: string
): Promise<DropboxEntry[]> {
  const res = await fetch(
    "https://api.dropboxapi.com/2/files/list_folder",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: path || "", limit: 200 }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dropbox list_folder failed: ${text}`);
  }
  const data = await res.json();
  return data.entries as DropboxEntry[];
}

export async function uploadFile(
  accessToken: string,
  path: string,
  data: ArrayBuffer
): Promise<DropboxEntry> {
  const blob = new Blob([data]);
  const res = await fetch(
    "https://content.dropboxapi.com/2/files/upload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Dropbox-API-Arg": JSON.stringify({
          path,
          mode: "add",
          autorename: true,
          mute: false,
        }),
        "Content-Type": "application/octet-stream",
      },
      body: blob,
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dropbox upload failed: ${text}`);
  }
  return res.json() as Promise<DropboxEntry>;
}

export async function getTemporaryLink(
  accessToken: string,
  path: string
): Promise<string> {
  const res = await fetch(
    "https://api.dropboxapi.com/2/files/get_temporary_link",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dropbox get_temporary_link failed: ${text}`);
  }
  const data = await res.json();
  return data.link as string;
}
