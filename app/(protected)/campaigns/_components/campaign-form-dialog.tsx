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
  createCampaignRecord,
  updateCampaignRecord,
} from "@/lib/supabase/campaign-actions";
import type { CampaignFormValues } from "@/lib/supabase/campaign-types";
import type { Campaign } from "@/types";

interface CampaignFormDialogProps {
  /** The client this campaign belongs to (or will belong to on create). */
  clientId: number;
  /** The campaign being edited, or `null` when creating a new one. */
  campaign: Campaign | null;
  /** The button (or other element) that opens the dialog. */
  trigger: React.ReactNode;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
];

const EMPTY_VALUES: CampaignFormValues = {
  campaign_name: "",
  objective: "",
  platform: "",
  status: "planning",
  start_date: "",
  end_date: "",
};

function valuesFromCampaign(campaign: Campaign | null): CampaignFormValues {
  if (!campaign) {
    return EMPTY_VALUES;
  }

  return {
    campaign_name: campaign.campaign_name ?? "",
    objective: campaign.objective ?? "",
    platform: campaign.platform ?? "",
    status: campaign.status ?? "planning",
    start_date: campaign.start_date ?? "",
    end_date: campaign.end_date ?? "",
  };
}

export function CampaignFormDialog({
  clientId,
  campaign,
  trigger,
}: CampaignFormDialogProps) {
  const router = useRouter();
  const isEditMode = campaign !== null;

  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState<CampaignFormValues>(() =>
    valuesFromCampaign(campaign)
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset the form to the latest campaign data each time the dialog
  // opens, so a previous unsaved edit (or a stale create-mode draft)
  // never leaks into the next time it's opened.
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setValues(valuesFromCampaign(campaign));
      setError(null);
    }
    setOpen(nextOpen);
  }

  function handleChange(field: keyof Omit<CampaignFormValues, "status">) {
    return (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  function handleStatusChange(value: string) {
    setValues((prev) => ({ ...prev, status: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const result =
        isEditMode && campaign
          ? await updateCampaignRecord(campaign.id, clientId, values)
          : await createCampaignRecord(clientId, values);

      if (result.error || !result.campaign) {
        const message =
          result.error ?? "Something went wrong. Please try again.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(isEditMode ? "Campaign updated." : "Campaign added.");
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
              {isEditMode ? "Edit Campaign" : "Add Campaign"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update this campaign's details."
                : "Add a new campaign for this client."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
            <div className="grid gap-2">
              <Label htmlFor="campaign_name">Campaign Name</Label>
              <Input
                id="campaign_name"
                value={values.campaign_name}
                onChange={handleChange("campaign_name")}
                disabled={isSaving}
                autoFocus
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="objective">Objective</Label>
              <Textarea
                id="objective"
                value={values.objective}
                onChange={handleChange("objective")}
                disabled={isSaving}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="platform">Platform</Label>
                <Input
                  id="platform"
                  value={values.platform}
                  onChange={handleChange("platform")}
                  disabled={isSaving}
                  placeholder="e.g. Instagram"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={values.status}
                  onValueChange={handleStatusChange}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={values.start_date}
                  onChange={handleChange("start_date")}
                  disabled={isSaving}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={values.end_date}
                  onChange={handleChange("end_date")}
                  disabled={isSaving}
                />
              </div>
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
