import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrganisationProvider } from "@/lib/context/organisation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/login");
  }

  if (!profile.org_id) {
    redirect("/onboarding");
  }

  const { data: organisation, error: orgError } = await supabase
    .from("organisations")
    .select("*")
    .eq("id", profile.org_id)
    .single();

  if (orgError || !organisation) {
    redirect("/onboarding");
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("org_id", profile.org_id)
    .order("created_at", { ascending: false });

  return (
    <OrganisationProvider
      profile={profile}
      organisation={organisation}
      projects={projects ?? []}
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </OrganisationProvider>
  );
}
