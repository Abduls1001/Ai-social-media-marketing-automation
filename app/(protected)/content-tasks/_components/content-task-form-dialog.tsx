"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createContentTaskRecord,
  updateContentTaskRecord,
} from "@/lib/supabase/content-task-actions";
import type { ContentTaskFormValues } from "@/lib/supabase/content-task-types";
import type { ContentTask } from "@/types";

interface ContentTaskFormDialogProps {
  /** The campaign this content task belongs to (or will belong to on create). */
  campaignId: number;
  /** The content task being edited, or `null` when creating a new one. */
  contentTask: ContentTask | null;
  /** The button (or other element) that opens the dialog. */
  trigger: React.ReactNode;
}

const PLATFORM_OPTIONS: { value: string; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "tiktok", label: "TikTok" },
  { value: "x", label: "X" },
  { value: "youtube", label: "YouTube" },
  { value: "blog", label: "Blog" },
];

const CONTENT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "post", label: "Post" },
  { value: "reel", label: "Reel" },
  { value: "carousel", label: "Carousel" },
  { value: "story", label: "Story" },
  { value: "short_video", label: "Short Video" },
  { value: "blog", label: "Blog" },
];

const PRIORITY_OPTIONS: { value: string; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
];

const EMPTY_VALUES: ContentTaskFormValues = {
  title: "",
  description: "",
  platform: "instagram",
  content_type: "post",
  priority: "medium",
  status: "todo",
  due_date: "",
};

function valuesFromContentTask(
  contentTask: ContentTask | null
): ContentTaskFormValues {
  if (!contentTask) {
    return EMPTY_VALUES;
  }

  return {
    title: contentTask.title ?? "",
    description: contentTask.description ?? "",
    platform: contentTask.platform ?? "instagram",
    content_type: contentTask.content_type ?? "post",
    priority: contentTask.priority ?? "medium",
    status: contentTask.status ?? "todo",
    due_date: contentTask.due_date ?? "",
  };
}

export function ContentTaskFormDialog({
  campaignId,
  contentTask,
  trigger,
}: ContentTaskFormDialogProps) {
  const router = useRouter();
  const isEditMode = contentTask !== null;

  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState<ContentTaskFormValues>(() =>
    valuesFromContentTask(contentTask)
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset the form to the latest content task data each time the dialog
  // opens, so a previous unsaved edit (or a stale create-mode draft)
  // never leaks into the next time it's opened.
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setValues(valuesFromContentTask(contentTask));
      setError(null);
    }
    setOpen(nextOpen);
  }

  function handleChange(
    field: keyof Pick<ContentTaskFormValues, "title" | "description" | "due_date">
  ) {
    return (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  function handleSelectChange(
    field: keyof Pick<
      ContentTaskFormValues,
      "platform" | "content_type" | "priority" | "status"
    >
  ) {
    return (value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const result =
        isEditMode && contentTask
          ? await updateContentTaskRecord(contentTask.id, campaignId, values)
          : await createContentTaskRecord(campaignId, values);

      if (result.error || !result.contentTask) {
        const message =
          result.error ?? "Something went wrong. Please try again.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(isEditMode ? "Content task updated." : "Content task added.");
      setOpen(false);
      router.refresh();
    } catch {
      const message = "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Content Task" : "Add Content Task"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update this content task's details."
                : "Add a new content task for this campaign."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={values.title}
                onChange={handleChange("title")}
                disabled={isSaving}
                autoFocus
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={values.description}
                onChange={handleChange("description")}
                disabled={isSaving}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={values.platform}
                  onValueChange={handleSelectChange("platform")}
                  disabled={isSaving}
                >
                  <SelectTrigger id="platform" className="w-full">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORM_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="content_type">Content Type</Label>
                <Select
                  value={values.content_type}
                  onValueChange={handleSelectChange("content_type")}
                  disabled={isSaving}
                >
                  <SelectTrigger id="content_type" className="w-full">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={values.priority}
                  onValueChange={handleSelectChange("priority")}
                  disabled={isSaving}
                >
                  <SelectTrigger id="priority" className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={values.status}
                  onValueChange={handleSelectChange("status")}
                  disabled={isSaving}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={values.due_date}
                onChange={handleChange("due_date")}
                disabled={isSaving}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="animate-spin" />}
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
