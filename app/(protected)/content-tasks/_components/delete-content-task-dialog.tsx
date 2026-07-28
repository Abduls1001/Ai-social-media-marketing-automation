"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteContentTaskRecord } from "@/lib/supabase/content-task-actions";
import type { ContentTask } from "@/types";

interface DeleteContentTaskDialogProps {
  campaignId: number;
  contentTask: ContentTask;
  trigger: React.ReactNode;
}

export function DeleteContentTaskDialog({
  campaignId,
  contentTask,
  trigger,
}: DeleteContentTaskDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  async function handleConfirm(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDeleting(true);

    try {
      const result = await deleteContentTaskRecord(contentTask.id, campaignId);

      if (!result.success) {
        const message =
          result.error ?? "Something went wrong. Please try again.";
        toast.error(message);
        return;
      }

      toast.success("Content task deleted.");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {contentTask.title}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove this content task from your
            workspace. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="animate-spin" />}
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
