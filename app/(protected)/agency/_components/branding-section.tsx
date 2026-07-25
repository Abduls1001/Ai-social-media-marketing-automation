import { Image as ImageIcon, Palette } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Agency } from "@/types";

interface BrandingSectionProps {
  agency: Agency;
}

const DEFAULT_PRIMARY_COLOR = "#4F46E5";
const DEFAULT_SECONDARY_COLOR = "#14B8A6";

export function BrandingSection({ agency }: BrandingSectionProps) {
  const primaryColor = agency.primary_color ?? DEFAULT_PRIMARY_COLOR;
  const secondaryColor = agency.secondary_color ?? DEFAULT_SECONDARY_COLOR;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding</CardTitle>
        <CardDescription>
          Visual identity used across client-facing reports and this
          workspace.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <span
            className="size-10 shrink-0 rounded-md border"
            style={{ backgroundColor: primaryColor }}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium">Primary Brand Color</p>
            <p className="truncate text-sm text-muted-foreground">
              {primaryColor}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="size-10 shrink-0 rounded-md border"
            style={{ backgroundColor: secondaryColor }}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium">Secondary Brand Color</p>
            <p className="truncate text-sm text-muted-foreground">
              {secondaryColor}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {agency.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-provided URL, not a local/static asset
            <img
              src={agency.logo_url}
              alt={`${agency.agency_name} logo`}
              className="size-10 shrink-0 rounded-md border object-cover"
            />
          ) : (
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-md border border-dashed bg-muted text-muted-foreground"
              aria-hidden="true"
            >
              <ImageIcon className="size-5" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium">Agency Logo</p>
            <p className="truncate text-sm text-muted-foreground">
              {agency.logo_url ? "Logo uploaded" : "No file uploaded"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {agency.favicon_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-provided URL, not a local/static asset
            <img
              src={agency.favicon_url}
              alt={`${agency.agency_name} favicon`}
              className="size-10 shrink-0 rounded-md border object-cover"
            />
          ) : (
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-md border border-dashed bg-muted text-muted-foreground"
              aria-hidden="true"
            >
              <Palette className="size-5" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium">Favicon</p>
            <p className="truncate text-sm text-muted-foreground">
              {agency.favicon_url ? "Favicon uploaded" : "No file uploaded"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
