import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAgencyForUser } from "@/lib/supabase/agencies";
import { getClientById } from "@/lib/supabase/clients";
import { getCampaignById } from "@/lib/supabase/campaigns";
import { getContentTasksForCampaign } from "@/lib/supabase/content-tasks";
import { AUTH_ROUTES } from "@/lib/constants";

import { ContentTasksErrorState } from "./_components/content-tasks-error-state";
import { ContentTasksList } from "./_components/content-tasks-list";
import { ContentTasksNeedsCampaignState } from "./_components/content-tasks-needs-campaign-state";

// This page reads the current user's session and queries the database on
// every request, so it must never be statically cached or prerendered.
export const dynamic = "force-dynamic";

interface ContentTasksPageProps {
  searchParams: Promise<{ campaign?: string }>;
}

export default async function ContentTasksPage({
  searchParams,
}: ContentTasksPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const { agency, error: agencyError } = await getAgencyForUser(user.id);

  if (agencyError) {
    return <ContentTasksErrorState message={agencyError} />;
  }

  if (!agency) {
    return <ContentTasksNeedsCampaignState />;
  }

  const { campaign: campaignIdParam } = await searchParams;
  const campaignId = campaignIdParam ? Number(campaignIdParam) : NaN;

  if (!campaignIdParam || Number.isNaN(campaignId)) {
    return <ContentTasksNeedsCampaignState />;
  }

  const { campaign, error: campaignError } = await getCampaignById(campaignId);

  if (campaignError) {
    return <ContentTasksErrorState message={campaignError} />;
  }

  if (!campaign) {
    return <ContentTasksNeedsCampaignState />;
  }

  const { client, error: clientError } = await getClientById(
    campaign.client_id
  );

  if (clientError) {
    return <ContentTasksErrorState message={clientError} />;
  }

  // Not found, or belongs to a different agency — either way, this isn't
  // a valid campaign for the current user.
  if (!client || client.agency_id !== agency.id) {
    return <ContentTasksNeedsCampaignState />;
  }

  const { contentTasks, error: contentTasksError } =
    await getContentTasksForCampaign(campaignId);

  if (contentTasksError) {
    return <ContentTasksErrorState message={contentTasksError} />;
  }

  return (
    <ContentTasksList
      campaignId={campaignId}
      campaign={campaign}
      contentTasks={contentTasks}
    />
  );
}
