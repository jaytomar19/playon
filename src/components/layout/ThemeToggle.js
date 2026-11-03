"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme";

// The <html> element's "dark" class is the source of truth (set before paint
// by the script in layout.js). We watch it rather than duplicate it in state.
function subscribe(callback) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const getIsDark = () => document.documentElement.classList.contains("dark");

export default function ThemeToggle() {
  // `null` on the server: the icon appears once the theme is known.
  const isDark = useSyncExternalStore(subscribe, getIsDark, () => null);

  function toggle() {
    const next = isDark ? "light" : "dark";
    const root = document.documentElement;
    root.classList.toggle("dark", next === "dark");
    root.style.colorScheme = next;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // The theme still changes for this visit if storage is blocked.
    }
  }

  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-foreground transition-colors hover:bg-surface-2"
    >
      {isDark === null ? null : isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
