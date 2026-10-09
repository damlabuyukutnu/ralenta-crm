"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  trigger?: ReactNode;
  triggerClassName?: string;
  menuClassName?: string;
  placement?: "top" | "bottom";
  children: ReactNode;
}

export function DropdownMenu({ trigger, triggerClassName, menuClassName, placement = "bottom", children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block w-full text-left">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open actions menu"
        className={cn(
          triggerClassName ?? "flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600",
        )}
      >
        {trigger ?? <MoreHorizontal className="h-4 w-4" />}
      </button>
      {open ? (
        <div
          role="menu"
          onClick={() => setOpen(false)}
          className={cn(
            "absolute z-20 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-md",
            placement === "bottom" ? "right-0 top-full mt-1" : "right-0 bottom-full mb-1",
            menuClassName,
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

interface DropdownMenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  active?: boolean;
}

export function DropdownMenuItem({ children, onClick, destructive, active }: DropdownMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50",
        destructive ? "text-rose-600" : "text-slate-700",
        active ? "bg-brand-50 text-brand-700" : "",
      )}
    >
      {children}
    </button>
  );
}
