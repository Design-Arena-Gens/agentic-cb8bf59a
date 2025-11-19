"use client";

import { useMemo } from "react";
import { clsx } from "clsx";
import { useBuilderStore } from "@/state/builder-store";
import type { ElementNode } from "@/types/builder";

type NavigatorItemProps = {
  node: ElementNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const KIND_BADGES: Record<string, string> = {
  hero: "Hero",
  section: "Section",
  container: "Container",
  heading: "Heading",
  paragraph: "Text",
  button: "Button",
  form: "Form",
  navbar: "Navbar",
  carousel: "Carousel",
  card: "Card",
  footer: "Footer",
  image: "Image",
  input: "Field"
};

const NavigatorRow = ({ node, depth, selectedId, onSelect }: NavigatorItemProps) => {
  const badge = KIND_BADGES[node.kind] ?? node.kind;
  return (
    <li role="treeitem" aria-selected={node.id === selectedId} aria-level={depth + 1}>
      <button
        type="button"
        tabIndex={0}
        onClick={() => onSelect(node.id)}
        className={clsx(
          "flex w-full items-center justify-between rounded-md py-2 pr-3 text-left text-sm transition focus-visible:outline focus-visible:outline-accent",
          node.id === selectedId
            ? "bg-accent/10 text-accent"
            : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-graphite-700"
        )}
        style={{ paddingLeft: 12 + depth * 16 }}
      >
        <span className="flex items-center gap-2">
          <span className="font-medium">{node.label}</span>
          <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400 dark:border-graphite-500 dark:text-slate-400">
            {badge}
          </span>
        </span>
      </button>
      {node.children.length > 0 ? (
        <ul role="group" className="mt-1 space-y-1">
          {node.children.map((child) => (
            <NavigatorRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
};

export const NavigatorPanel = () => {
  const elements = useBuilderStore((state) => state.elements);
  const selectedId = useBuilderStore((state) => state.selectedId);
  const setSelected = useBuilderStore((state) => state.setSelected);

  const tree = useMemo(
    () =>
      elements.map((node) => (
        <NavigatorRow
          key={node.id}
          node={node}
          depth={0}
          selectedId={selectedId}
          onSelect={setSelected}
        />
      )),
    [elements, selectedId, setSelected]
  );

  return (
    <nav aria-label="Element navigator" className="h-full overflow-y-auto">
      <ul role="tree" className="space-y-2 px-2 py-3">
        {tree.length > 0 ? tree : <li className="text-sm text-slate-500">Canvas is empty.</li>}
      </ul>
    </nav>
  );
};
