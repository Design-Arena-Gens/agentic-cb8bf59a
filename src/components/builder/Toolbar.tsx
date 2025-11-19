"use client";

import { clsx } from "clsx";
import { BREAKPOINTS } from "@/constants/breakpoints";
import { useBuilderStore } from "@/state/builder-store";
import { Button } from "@/components/ui/button";

const toolbarButton =
  "rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-accent dark:text-slate-300 dark:hover:bg-graphite-700";

export const Toolbar = ({ onToggleTheme }: { onToggleTheme: () => void }) => {
  const activeBreakpoint = useBuilderStore((state) => state.activeBreakpoint);
  const setActiveBreakpoint = useBuilderStore((state) => state.setActiveBreakpoint);
  const undo = useBuilderStore((state) => state.undo);
  const redo = useBuilderStore((state) => state.redo);
  const canUndo = useBuilderStore((state) => state.canUndo);
  const canRedo = useBuilderStore((state) => state.canRedo);

  return (
    <header
      role="banner"
      className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-graphite-600 dark:bg-graphite-800"
    >
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" aria-label="Page manager">
          Pages
        </Button>
        <button type="button" className={toolbarButton} aria-label="Preview design">
          Preview
        </button>
        <button type="button" className={toolbarButton} aria-label="Publish design">
          Publish
        </button>
      </div>

      <div className="flex items-center gap-3" role="toolbar" aria-label="Responsive controls">
        {Object.entries(BREAKPOINTS).map(([id, config]) => (
          <button
            key={id}
            type="button"
            className={clsx(
              "rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide focus-visible:outline focus-visible:outline-accent",
              id === activeBreakpoint
                ? "bg-accent text-white shadow"
                : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-graphite-700"
            )}
            onClick={() => setActiveBreakpoint(id as typeof activeBreakpoint)}
            aria-pressed={id === activeBreakpoint}
          >
            {config.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          aria-disabled={!canUndo}
          disabled={!canUndo}
        >
          Undo
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          aria-disabled={!canRedo}
          disabled={!canRedo}
        >
          Redo
        </Button>
        <Button variant="ghost" size="sm" onClick={onToggleTheme}>
          Theme
        </Button>
      </div>
    </header>
  );
};
