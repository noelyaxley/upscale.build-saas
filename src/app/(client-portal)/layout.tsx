export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-14 items-center px-4">
          <span className="text-lg font-bold tracking-tight">
            Upscale<span className="text-primary">.Build</span>
          </span>
          <span className="ml-3 text-sm text-muted-foreground">
            Client Portal
          </span>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
