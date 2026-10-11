// Server-function middleware: authenticated AND holds a staff role
// (admin / manager / dispatcher / accountant). Use for any server function
// that spends external resources (AI credits) or mutates operational data,
// so non-staff accounts are rejected before any work is done.
import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const requireStaff = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { data, error } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
    if (error || data !== true) throw new Error("Forbidden: staff role required");
    return next();
  });
