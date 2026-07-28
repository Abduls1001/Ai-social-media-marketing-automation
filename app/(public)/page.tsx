import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { AUTH_ROUTES, PROTECTED_PATHS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// This page checks the current user's session on every request to decide
// where "Get Started" should go, so it must never be statically cached or
// prerendered at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Authenticated visitors go straight to the dashboard; everyone else is
  // sent to login first (they're redirected back to the dashboard after
  // signing in via LoginForm's redirectTo handling).
  const getStartedHref = user ? PROTECTED_PATHS[0] : AUTH_ROUTES.login;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold tracking-tight sm:text-4xl">
            AI Social Media Operations Platform
          </CardTitle>
          <CardDescription className="text-base">
            Enterprise AI-powered Marketing Operations Platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={getStartedHref}>Get Started</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
