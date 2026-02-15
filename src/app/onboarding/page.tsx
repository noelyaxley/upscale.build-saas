"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OnboardingPage() {
  const [orgName, setOrgName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Logo must be under 2MB");
      return;
    }

    setLogoFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to create an organisation.");
        setLoading(false);
        return;
      }

      // 1. Create the organisation
      const { data: org, error: orgError } = await supabase
        .from("organisations")
        .insert({ name: orgName })
        .select()
        .single();

      if (orgError) throw orgError;

      // 2. Upload logo if provided (now we have org.id)
      let logoUrl: string | null = null;
      if (logoFile) {
        const fileExt = logoFile.name.split(".").pop();
        const filePath = `${org.id}/logo.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("organisation-logos")
          .upload(filePath, logoFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("organisation-logos")
          .getPublicUrl(filePath);

        logoUrl = urlData.publicUrl;
      }

      // 3. Update org with logo_url if uploaded
      if (logoUrl) {
        const { error: logoUpdateError } = await supabase
          .from("organisations")
          .update({ logo_url: logoUrl })
          .eq("id", org.id);

        if (logoUpdateError) throw logoUpdateError;
      }

      // 4. Update profile with contact details and org link
      const fullName = `${firstName} ${lastName}`.trim();
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          org_id: org.id,
          role: "admin",
          full_name: fullName || null,
          first_name: firstName || null,
          last_name: lastName || null,
          phone: phone || null,
        } as any)
        .eq("id", user.id);

      if (profileError) throw profileError;

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative size-16 cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-primary/50"
            >
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreview}
                  alt="Organisation logo"
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <Image
                    src="/logo-64.png"
                    alt="Upscale.Build"
                    width={48}
                    height={48}
                  />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="size-5 text-white" />
              </div>
            </button>
            <p className="mt-1 text-xs text-muted-foreground">Add your logo</p>
          </div>
          <CardTitle>Set up your organisation</CardTitle>
          <CardDescription>
            Tell us about yourself and your company
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  placeholder="Sam"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  minLength={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Smith"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  minLength={1}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0412 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgName">Organisation name</Label>
              <Input
                id="orgName"
                type="text"
                placeholder="Acme Construction"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                minLength={2}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Setting up..." : "Get Started"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
