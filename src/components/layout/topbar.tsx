"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { matchNavItem } from "@/lib/navigation";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const current = matchNavItem(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <h1 className="text-base font-semibold text-slate-900">{current?.label ?? "Ralenta"}</h1>
    </header>
  );
}
