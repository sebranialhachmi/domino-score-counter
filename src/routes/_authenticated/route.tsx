import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Topbar } from "@/components/Topbar";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    // Signed in is not enough: the admin area is for staff roles only.
    // (Data is still protected by RLS; this keeps non-staff out of the UI.)
    const { data: staff, error: staffErr } = await supabase.rpc("is_staff", { _user_id: data.user.id });
    // A failed lookup (e.g. network) must not sign real staff out — surface it instead.
    if (staffErr) throw new Error(staffErr.message);
    if (staff !== true) {
      await supabase.auth.signOut();
      toast.error("لا تملك صلاحية الدخول إلى لوحة التحكم / You don't have access to the admin panel");
      throw redirect({ to: "/auth" });
    }
    return { user: data.user };
  },
  component: Layout,
});

function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-4 md:p-6 max-w-full">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
