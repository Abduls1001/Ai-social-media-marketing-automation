import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";

import { PostFormDialog } from "./post-form-dialog";

interface PostsEmptyStateProps {
  contentTaskId: number;
}

export function PostsEmptyState({ contentTaskId }: PostsEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <div
        className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <FileText className="size-7" />
      </div>

      <div className="max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">
          No posts yet
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add your first post to start feeding future AI generation and
          publishing for this content task.
        </p>
      </div>

      <PostFormDialog
        contentTaskId={contentTaskId}
        post={null}
        trigger={
          <Button type="button" className="mt-2">
            Add Post
          </Button>
        }
      />
    </div>
  );
}
