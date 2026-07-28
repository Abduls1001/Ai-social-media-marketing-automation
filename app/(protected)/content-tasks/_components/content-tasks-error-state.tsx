import { AlertTriangle } from "lucide-react";

interface ContentTasksErrorStateProps {
  message?: string;
}

export function ContentTasksErrorState({
  message,
}: ContentTasksErrorStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <div
        className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive"
        aria-hidden="true"
      >
        <AlertTriangle className="size-7" />
      </div>

      <div className="max-w-md">
        <h1 className="text-xl font-semibold tracking-tight">
          Couldn&apos;t load your content tasks
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong while fetching your content tasks. Please
          try refreshing the page.
        </p>
        {message && (
          <p className="mt-2 text-xs text-muted-foreground/80">{message}</p>
        )}
      </div>
    </div>
  );
}
