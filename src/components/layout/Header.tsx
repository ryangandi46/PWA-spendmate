"use client";

import { useAppStore } from "@/store/useAppStore";

export default function Header({ title }: { title?: string }) {
  const { toggleSidebar } = useAppStore();

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {title && (
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          )}
        </div>
      </div>
    </header>
  );
}
