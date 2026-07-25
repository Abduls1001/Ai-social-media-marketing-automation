"use client";

import { useSidebarState } from "@/hooks/use-sidebar-state";
import { AppSidebar } from "@/components/layouts/app-sidebar";
import { SiteHeader } from "@/components/layouts/site-header";

interface AppShellProps {
  email: string;
  children: React.ReactNode;
}

export function AppShell({ email, children }: AppShellProps) {
  const {
    isCollapsed,
    toggleCollapsed,
    isMobileOpen,
    openMobile,
    closeMobile,
  } = useSidebarState();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar
        collapsed={isCollapsed}
        mobileOpen={isMobileOpen}
        onCloseMobile={closeMobile}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <SiteHeader
          email={email}
          isCollapsed={isCollapsed}
          onToggleCollapsed={toggleCollapsed}
          onOpenMobileNav={openMobile}
        />
        <main className="flex flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
