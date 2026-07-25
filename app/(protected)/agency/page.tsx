import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAgencyForUser } from "@/lib/supabase/agencies";
import { AUTH_ROUTES } from "@/lib/constants";

import { AgencyHeader } from "./_components/agency-header";
import { OverviewCards } from "./_components/overview-cards";
import { AgencyProfileSection } from "./_components/agency-profile-section";
import { BrandingSection } from "./_components/branding-section";
import { WorkspaceInfoSection } from "./_components/workspace-info-section";
import { QuickActionsSection } from "./_components/quick-actions-section";
import { AgencyEmptyState } from "./_components/agency-empty-state";
import { AgencyErrorState } from "./_components/agency-error-state";

// This page reads the current user's session and queries the database on
// every request, so it must never be statically cached or prerendered.
export const dynamic = "force-dynamic";

export default async function AgencyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const { agency, error } = await getAgencyForUser(user.id);

  if (error) {
    return <AgencyErrorState message={error} />;
  }

  if (!agency) {
    return <AgencyEmptyState />;
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 lg:p-8">
      <AgencyHeader agency={agency} />

      <OverviewCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AgencyProfileSection agency={agency} />
        <BrandingSection agency={agency} />
      </div>

      <WorkspaceInfoSection agency={agency} />

      <QuickActionsSection />
    </div>
  );
}
