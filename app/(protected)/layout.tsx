import { redirect } from "next/navigation";

import { AppShell } from "@/components/layouts";
import { createClient } from "@/lib/supabase/server";
import { AUTH_ROUTES } from "@/lib/constants";

// Always render on request: this layout depends on the current user's
// session and must never be statically cached or prerendered at build time.
export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  return <AppShell email={user.email ?? ""}>{children}</AppShell>;
}
