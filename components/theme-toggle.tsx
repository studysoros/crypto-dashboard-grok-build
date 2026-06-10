"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  THEMES,
  getThemeConfig,
  type ThemeId,
} from "@/lib/themes";

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Intentional: mark as mounted on client to avoid hydration mismatch for theme icon.
    // This is the standard safe pattern used with next-themes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Close popup on outside click or Escape
  React.useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Avoid hydration mismatch: render a disabled placeholder until mounted
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-9 w-9", className)}
        disabled
        aria-label="Theme settings"
      >
        <Check className="h-4 w-4" />
      </Button>
    );
  }

  const currentSetting = (theme ?? "system") as ThemeId;

  // Determine which icon to show on the trigger button.
  // For "system" we show the icon of the actually resolved theme for visual clarity.
  const effectiveId =
    currentSetting === "system" ? (resolvedTheme as ThemeId | undefined) : currentSetting;
  const triggerConfig = getThemeConfig(effectiveId);
  const TriggerIcon = triggerConfig.Icon;

  const handleSelect = (value: ThemeId) => {
    setTheme(value);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        className="h-9 w-9"
        aria-label="Theme settings"
        aria-expanded={open}
        aria-haspopup="menu"
        title="Choose theme"
      >
        <TriggerIcon className="h-4 w-4" />
      </Button>

      {open && (
        <>
          {/* Solid backdrop so the theme popup feels like a modal (page background is no longer "transparent" behind it) */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div
            role="menu"
            aria-label="Theme"
            className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-md border bg-[hsl(var(--popover))] text-popover-foreground shadow-2xl ring-1 ring-border"
          >
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Theme
            </div>
            <div className="py-1">
              {THEMES.map(({ id, label, Icon }) => {
                const isActive = currentSetting === id;
                return (
                  <button
                    key={id}
                    role="menuitem"
                    onClick={() => handleSelect(id)}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{label}</span>
                    {isActive && <Check className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
