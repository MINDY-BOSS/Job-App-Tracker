"use client";

import { EllipsisVertical } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type RowMenuItem =
  | { label: string; href: string; danger?: false }
  | { label: string; onSelect: () => void; danger?: boolean };

const MENU_WIDTH = 144;

/**
 * Small "⋮" actions menu; closes on outside click, Escape, scroll or selection.
 * The menu is fixed-positioned so a scrolling table container can't clip it.
 */
export function RowMenu({ label, items }: { label: string; items: RowMenuItem[] }) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const open = position !== null;
  const ref = useRef<HTMLDivElement>(null);
  const setOpen = (value: boolean) => {
    if (!value) return setPosition(null);
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const menuHeight = items.length * 36 + 8;
    const below = rect.bottom + 4;
    setPosition({
      top: below + menuHeight > window.innerHeight ? rect.top - menuHeight - 4 : below,
      left: Math.max(8, rect.right - MENU_WIDTH),
    });
  };

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setPosition(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPosition(null);
    };
    const close = () => setPosition(null);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const itemClass = (danger?: boolean) =>
    cn(
      "block w-full px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
      danger && "text-destructive",
    );

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="text-muted-foreground hover:text-foreground"
      >
        <EllipsisVertical />
      </Button>
      {position && (
        <div
          role="menu"
          style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
          className="fixed z-30 overflow-hidden rounded-lg border bg-card py-1 shadow-lg"
        >
          {items.map((item) =>
            "href" in item ? (
              <Link key={item.label} role="menuitem" href={item.href} className={itemClass()} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={itemClass(item.danger)}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
