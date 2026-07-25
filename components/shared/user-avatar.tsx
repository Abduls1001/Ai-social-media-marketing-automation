import { getInitials } from "@/lib/utils";

interface UserAvatarProps {
  email: string;
}

export function UserAvatar({ email }: UserAvatarProps) {
  return (
    <div
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
    >
      {getInitials(email)}
    </div>
  );
}
