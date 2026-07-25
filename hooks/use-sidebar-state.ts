"use client";

import { useCallback, useState } from "react";

/**
 * Manages the application shell's sidebar state:
 * - `isCollapsed`: icon-only vs full-width sidebar on tablet/desktop.
 * - `isMobileOpen`: whether the off-canvas drawer is open on mobile.
 */
export function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCollapsed = useCallback(() => setIsCollapsed((v) => !v), []);
  const openMobile = useCallback(() => setIsMobileOpen(true), []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);

  return {
    isCollapsed,
    toggleCollapsed,
    isMobileOpen,
    openMobile,
    closeMobile,
  };
}
