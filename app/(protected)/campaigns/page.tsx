import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAgencyForUser } from "@/lib/supabase/agencies";
import { getClientById } from "@/lib/supabase/clients";
import { getCampaignsForClient } from "@/lib/supabase/campaigns";
import { AUTH_ROUTES } from "@/lib/constants";

import { CampaignsErrorState } from "./_components/campaigns-error-state";
import { CampaignsList } from "./_components/campaigns-list";
import { CampaignsNeedsClientState } from "./_components/campaigns-needs-client-state";

// This page reads the current user's session and queries the database on
// every request, so it must never be statically cached or prerendered.
export const dynamic = "force-dynamic";

interface CampaignsPageProps {
  searchParams: Promise<{ client?: string }>;
}

export default async function CampaignsPage({
  searchParams,
}: CampaignsPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const { agency, error: agencyError } = await getAgencyForUser(user.id);

  if (agencyError) {
    return <CampaignsErrorState message={agencyError} />;
  }

  if (!agency) {
    return <CampaignsNeedsClientState />;
  }

  const { client: clientIdParam } = await searchParams;
  const clientId = clientIdParam ? Number(clientIdParam) : NaN;

  if (!clientIdParam || Number.isNaN(clientId)) {
    return <CampaignsNeedsClientState />;
  }

  const { client, error: clientError } = await getClientById(clientId);

  if (clientError) {
    return <CampaignsErrorState message={clientError} />;
  }

  // Not found, or belongs to a different agency — either way, this isn't
  // a valid client for the current user.
  if (!client || client.agency_id !== agency.id) {
    return <CampaignsNeedsClientState />;
  }

  const { campaigns, error: campaignsError } =
    await getCampaignsForClient(clientId);

  if (campaignsError) {
    return <CampaignsErrorState message={campaignsError} />;
  }

  return (
    <CampaignsList clientId={clientId} client={client} campaigns={campaigns} />
  );
}
