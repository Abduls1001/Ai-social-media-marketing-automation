"use client";

import { usePathname } from "next/navigation";
import {
  Bell,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/shared/user-avatar";
import { LogoutButton } from "@/components/shared/logout-button";
import { NAV_ITEMS } from "@/lib/constants";

interface SiteHeaderProps {
  email: string;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  onOpenMobileNav: () => void;
}

export function SiteHeader({
  email,
  isCollapsed,
  onToggleCollapsed,
  onOpenMobileNav,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const activeItem = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  const breadcrumbLabel = activeItem?.label ?? "Dashboard";

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          onClick={onToggleCollapsed}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="size-5" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="size-5" aria-hidden="true" />
          )}
        </Button>

        <Separator orientation="vertical" className="hidden h-6 sm:block" />

        <nav aria-label="Breadcrumb" className="hidden min-w-0 sm:block">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <li className="truncate">Home</li>
            <li aria-hidden="true">/</li>
            <li className="truncate font-medium text-foreground">
              {breadcrumbLabel}
            </li>
          </ol>
        </nav>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative hidden max-w-sm md:block">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search..."
            aria-label="Global search"
            className="w-56 pl-8 lg:w-72"
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Notifications"
        >
          <Bell className="size-5" aria-hidden="true" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-3">
          <UserAvatar email={email} />
          <span className="hidden text-sm font-medium sm:inline">
            {email}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
