-- Security: stop auto-granting the admin role on sign-up.
-- The previous handle_new_user() made the first account ever created an admin
-- whenever no admin existed (e.g. after the last admin was removed). New
-- accounts now get a profile only; roles are assigned by an admin from the
-- Users screen (adminCreateUser / adminSetRoles).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
