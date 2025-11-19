"use client";

import { useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { clsx } from "clsx";
import { COMPONENT_LIBRARY } from "@/constants/component-library";
import type { LibraryItem } from "@/constants/component-library";

type ComponentLibraryProps = {
  onInsert: (item: LibraryItem) => void;
};

const DraggableLibraryCard = ({
  item,
  onInsert
}: {
  item: LibraryItem;
  onInsert: (item: LibraryItem) => void;
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${item.id}`,
    data: {
      type: "library-item",
      item
    }
  });

  return (
    <article
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      tabIndex={0}
      className={clsx(
        "flex cursor-grab flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 text-left shadow hover:border-accent focus-visible:outline focus-visible:outline-accent dark:border-graphite-500 dark:bg-graphite-700",
        isDragging && "opacity-60"
      )}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.name}</h4>
        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-accent">
          {item.category}
        </span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-300">{item.description}</p>
      <button
        type="button"
        onClick={() => onInsert(item)}
        className="mt-auto w-full rounded-md bg-accent/10 px-2 py-1 text-xs font-semibold text-accent hover:bg-accent/20 focus-visible:outline focus-visible:outline-accent"
      >
        Add
      </button>
    </article>
  );
};

export const ComponentLibrary = ({ onInsert }: ComponentLibraryProps) => {
  const grouped = useMemo(() => {
    const entries = new Map<string, LibraryItem[]>();
    for (const item of COMPONENT_LIBRARY) {
      const existing = entries.get(item.category) ?? [];
      existing.push(item);
      entries.set(item.category, existing);
    }
    return Array.from(entries.entries());
  }, []);

  return (
    <div className="space-y-4 px-3 py-4">
      {grouped.map(([category, items]) => (
        <section key={category} aria-label={`${category} components`} className="space-y-3">
          <header className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              {category}
            </h3>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
              Drag & drop or click Add
            </span>
          </header>
          <div className="grid gap-3">
            {items.map((item) => (
              <DraggableLibraryCard key={item.id} item={item} onInsert={onInsert} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
