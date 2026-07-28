import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAgencyForUser } from "@/lib/supabase/agencies";
import { getClientsForAgency } from "@/lib/supabase/clients";
import { AUTH_ROUTES } from "@/lib/constants";

import { ClientsErrorState } from "./_components/clients-error-state";
import { ClientsList } from "./_components/clients-list";
import { ClientsNeedsAgencyState } from "./_components/clients-needs-agency-state";

// This page reads the current user's session and queries the database on
// every request, so it must never be statically cached or prerendered.
export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const { agency, error: agencyError } = await getAgencyForUser(user.id);

  if (agencyError) {
    return <ClientsErrorState message={agencyError} />;
  }

  if (!agency) {
    return <ClientsNeedsAgencyState />;
  }

  const { clients, error: clientsError } = await getClientsForAgency(
    agency.id
  );

  if (clientsError) {
    return <ClientsErrorState message={clientsError} />;
  }

  return <ClientsList agencyId={agency.id} clients={clients} />;
}
