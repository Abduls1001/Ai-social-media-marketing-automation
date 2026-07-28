import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAgencyForUser } from "@/lib/supabase/agencies";
import { getClientById } from "@/lib/supabase/clients";
import { getCampaignById } from "@/lib/supabase/campaigns";
import { getContentTaskById } from "@/lib/supabase/content-tasks";
import { getPostsForContentTask } from "@/lib/supabase/posts";
import { AUTH_ROUTES } from "@/lib/constants";

import { PostsErrorState } from "./_components/posts-error-state";
import { PostsList } from "./_components/posts-list";
import { PostsNeedsContentTaskState } from "./_components/posts-needs-content-task-state";

// This page reads the current user's session and queries the database on
// every request, so it must never be statically cached or prerendered.
export const dynamic = "force-dynamic";

interface PostsPageProps {
  searchParams: Promise<{ contentTask?: string }>;
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const { agency, error: agencyError } = await getAgencyForUser(user.id);

  if (agencyError) {
    return <PostsErrorState message={agencyError} />;
  }

  if (!agency) {
    return <PostsNeedsContentTaskState />;
  }

  const { contentTask: contentTaskIdParam } = await searchParams;
  const contentTaskId = contentTaskIdParam ? Number(contentTaskIdParam) : NaN;

  if (!contentTaskIdParam || Number.isNaN(contentTaskId)) {
    return <PostsNeedsContentTaskState />;
  }

  const { contentTask, error: contentTaskError } =
    await getContentTaskById(contentTaskId);

  if (contentTaskError) {
    return <PostsErrorState message={contentTaskError} />;
  }

  if (!contentTask) {
    return <PostsNeedsContentTaskState />;
  }

  const { campaign, error: campaignError } = await getCampaignById(
    contentTask.campaign_id
  );

  if (campaignError) {
    return <PostsErrorState message={campaignError} />;
  }

  if (!campaign) {
    return <PostsNeedsContentTaskState />;
  }

  const { client, error: clientError } = await getClientById(
    campaign.client_id
  );

  if (clientError) {
    return <PostsErrorState message={clientError} />;
  }

  // Not found, or belongs to a different agency — either way, this isn't
  // a valid content task for the current user.
  if (!client || client.agency_id !== agency.id) {
    return <PostsNeedsContentTaskState />;
  }

  const { posts, error: postsError } =
    await getPostsForContentTask(contentTaskId);

  if (postsError) {
    return <PostsErrorState message={postsError} />;
  }

  return (
    <PostsList
      contentTaskId={contentTaskId}
      contentTask={contentTask}
      posts={posts}
    />
  );
}
