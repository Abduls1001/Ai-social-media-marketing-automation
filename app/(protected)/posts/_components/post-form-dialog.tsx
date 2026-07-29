"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
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
import { createPostRecord, updatePostRecord } from "@/lib/supabase/post-actions";
import { generateAiCaptionForPost } from "@/lib/supabase/post-ai-actions";
import type { PostFormValues } from "@/lib/supabase/post-types";
import type { Post } from "@/types";

interface PostFormDialogProps {
  /** The content task this post belongs to (or will belong to on create). */
  contentTaskId: number;
  /** The post being edited, or `null` when creating a new one. */
  post: Post | null;
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

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "cancelled", label: "Cancelled" },
];

const EMPTY_VALUES: PostFormValues = {
  title: "",
  caption: "",
  platform: "instagram",
  status: "draft",
  scheduled_date: "",
};

function valuesFromPost(post: Post | null): PostFormValues {
  if (!post) {
    return EMPTY_VALUES;
  }

  return {
    title: post.title ?? "",
    caption: post.caption ?? "",
    platform: post.platform ?? "instagram",
    status: post.status ?? "draft",
    scheduled_date: post.scheduled_date ?? "",
  };
}

export function PostFormDialog({
  contentTaskId,
  post,
  trigger,
}: PostFormDialogProps) {
  const router = useRouter();
  const isEditMode = post !== null;

  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState<PostFormValues>(() =>
    valuesFromPost(post)
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isGeneratingCaption, setIsGeneratingCaption] = React.useState(false);

  // Reset the form to the latest post data each time the dialog opens,
  // so a previous unsaved edit (or a stale create-mode draft) never
  // leaks into the next time it's opened.
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setValues(valuesFromPost(post));
      setError(null);
    }
    setOpen(nextOpen);
  }

  function handleChange(
    field: keyof Pick<PostFormValues, "title" | "caption" | "scheduled_date">
  ) {
    return (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  function handleSelectChange(
    field: keyof Pick<PostFormValues, "platform" | "status">
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
        isEditMode && post
          ? await updatePostRecord(post.id, contentTaskId, values)
          : await createPostRecord(contentTaskId, values);

      if (result.error || !result.post) {
        const message =
          result.error ?? "Something went wrong. Please try again.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(isEditMode ? "Post updated." : "Post added.");
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

  // AI caption generation writes straight to the saved post's caption
  // column (Server Action does its own Supabase update), so this is
  // only available in edit mode — a post must already exist to save a
  // caption onto it.
  async function handleGenerateCaption() {
    if (!post) {
      return;
    }

    setError(null);
    setIsGeneratingCaption(true);

    try {
      const result = await generateAiCaptionForPost(post.id, contentTaskId);

      if (result.error || !result.post) {
        const message =
          result.error ?? "Something went wrong. Please try again.";
        toast.error(message);
        return;
      }

      setValues((prev) => ({ ...prev, caption: result.post!.caption ?? "" }));
      toast.success("Caption generated.");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsGeneratingCaption(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Post" : "Add Post"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update this post's details."
                : "Add a new post for this content task."}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="caption">Caption</Label>
                {isEditMode && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateCaption}
                    disabled={isSaving || isGeneratingCaption}
                  >
                    {isGeneratingCaption ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Sparkles />
                    )}
                    {isGeneratingCaption
                      ? "Generating..."
                      : values.caption.trim()
                        ? "Regenerate Caption"
                        : "Generate AI Caption"}
                  </Button>
                )}
              </div>
              <Textarea
                id="caption"
                value={values.caption}
                onChange={handleChange("caption")}
                disabled={isSaving || isGeneratingCaption}
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
              <Label htmlFor="scheduled_date">Scheduled Date</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={values.scheduled_date}
                onChange={handleChange("scheduled_date")}
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
