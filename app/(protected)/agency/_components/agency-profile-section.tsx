import { Building2, Clock, Globe, Mail, MapPin, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Agency } from "@/types";

interface AgencyProfileSectionProps {
  agency: Agency;
}

interface ProfileField {
  label: string;
  value: string;
  icon: LucideIcon;
}

const FALLBACK = "—";

export function AgencyProfileSection({ agency }: AgencyProfileSectionProps) {
  const fields: ProfileField[] = [
    { label: "Agency Name", value: agency.agency_name, icon: Building2 },
    { label: "Email", value: agency.email ?? FALLBACK, icon: Mail },
    { label: "Phone", value: agency.phone ?? FALLBACK, icon: Phone },
    { label: "Website", value: agency.website ?? FALLBACK, icon: Globe },
    { label: "Country", value: agency.country ?? FALLBACK, icon: MapPin },
    { label: "Time Zone", value: agency.timezone ?? FALLBACK, icon: Clock },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agency Profile</CardTitle>
        <CardDescription>
          Basic information about your agency workspace.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          {agency.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-provided URL, not a local/static asset
            <img
              src={agency.logo_url}
              alt={`${agency.agency_name} logo`}
              className="size-16 shrink-0 rounded-xl border object-cover"
            />
          ) : (
            <div
              className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-dashed bg-muted text-muted-foreground"
              aria-hidden="true"
            >
              <Building2 className="size-7" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium">Agency Logo</p>
            <p className="text-sm text-muted-foreground">
              {agency.logo_url ? "Logo uploaded" : "No logo uploaded"}
            </p>
          </div>
        </div>

        <Separator />

        <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          {fields.map((field) => {
            const Icon = field.icon;

            return (
              <div key={field.label} className="flex items-start gap-3">
                <Icon
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {field.label}
                  </dt>
                  <dd className="truncate text-sm">{field.value}</dd>
                </div>
              </div>
            );
          })}
        </dl>
      </CardContent>
    </Card>
  );
}
