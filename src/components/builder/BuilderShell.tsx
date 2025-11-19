"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from "@dnd-kit/core";
import { clsx } from "clsx";
import { ComponentLibrary } from "@/components/builder/ComponentLibrary";
import { NavigatorPanel } from "@/components/builder/NavigatorPanel";
import { SettingsPanel } from "@/components/builder/SettingsPanel";
import { Toolbar } from "@/components/builder/Toolbar";
import { Canvas } from "@/components/builder/Canvas";
import { Panel } from "@/components/ui/panel";
import { ElementRenderer } from "@/components/builder/ElementRenderer";
import { useBuilderStore } from "@/state/builder-store";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { COMPONENT_LIBRARY, type LibraryItem } from "@/constants/component-library";
import type { ElementNode } from "@/types/builder";

type ActiveDrag =
  | {
      type: "library-item";
      item: LibraryItem;
    }
  | {
      type: "canvas-element";
      node: ElementNode;
    }
  | null;

const cloneNode = (node: ElementNode): ElementNode => ({
  ...node,
  props: { ...node.props },
  responsiveStyle: {
    desktop: { ...node.responsiveStyle.desktop },
    tablet: { ...node.responsiveStyle.tablet },
    mobile: { ...node.responsiveStyle.mobile }
  },
  children: node.children.map(cloneNode)
});

const findNodeById = (nodes: ElementNode[], id: string): ElementNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    const child = findNodeById(node.children, id);
    if (child) return child;
  }
  return null;
};

const containsNode = (nodes: ElementNode[], parentId: string, searchId: string): boolean => {
  const parent = findNodeById(nodes, parentId);
  if (!parent) return false;
  const queue = [...parent.children];
  while (queue.length) {
    const current = queue.shift()!;
    if (current.id === searchId) return true;
    queue.push(...current.children);
  }
  return false;
};

export const BuilderShell = () => {
  const [isDark, toggleTheme] = useDarkMode();
  const addElement = useBuilderStore((state) => state.addElement);
  const moveElement = useBuilderStore((state) => state.moveElement);
  const activeBreakpoint = useBuilderStore((state) => state.activeBreakpoint);
  const selectedId = useBuilderStore((state) => state.selectedId);
  const elements = useBuilderStore((state) => state.elements);
  const setSelected = useBuilderStore((state) => state.setSelected);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current;
    if (!data) return;
    if (data.type === "library-item") {
      setActiveDrag({ type: "library-item", item: data.item as LibraryItem });
    }
    if (data.type === "canvas-element") {
      setActiveDrag({ type: "canvas-element", node: data.node as ElementNode });
      setSelected((data.node as ElementNode).id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeData = active.data.current;
    const overData = over?.data.current;
    setActiveDrag(null);
    if (!activeData || !overData) {
      return;
    }

    if (activeData.type === "library-item") {
      const template = activeData.item.template;
      const parentId =
        overData.type === "canvas-dropzone"
          ? (overData.parentId as string | null)
          : (overData.parentId as string | null);
      const index =
        overData.type === "canvas-placeholder"
          ? (overData.index as number)
          : Number.MAX_SAFE_INTEGER;
      addElement(parentId, cloneNode(template), index);
      return;
    }

    if (activeData.type === "canvas-element") {
      const elementId = (active.id as string) ?? activeData.node.id;
      if (overData.type === "canvas-placeholder") {
        const parentId = overData.parentId as string | null;
        const index = overData.index as number;
        if (parentId === elementId) {
          return;
        }
        moveElement(elementId, parentId, index);
        return;
      }
      if (overData.type === "canvas-dropzone") {
        const parentId = overData.parentId as string;
        if (parentId === elementId) {
          return;
        }
        if (containsNode(elements, elementId, parentId)) {
          return;
        }
        moveElement(elementId, parentId, Number.MAX_SAFE_INTEGER);
      }
    }
  };

  const handleDropCancel = () => setActiveDrag(null);

  const overlay = useMemo(() => {
    if (!activeDrag) return null;
    if (activeDrag.type === "library-item") {
      return (
        <div className="min-w-[220px] rounded-lg border border-accent bg-white px-4 py-3 text-sm shadow-lg dark:bg-graphite-700">
          <p className="font-semibold text-slate-700 dark:text-slate-200">{activeDrag.item.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-300">{activeDrag.item.description}</p>
        </div>
      );
    }
    return (
      <div className="w-[320px] rounded-lg border border-accent bg-white p-3 shadow-lg dark:bg-graphite-700">
        <ElementRenderer
          node={activeDrag.node}
          breakpoint={activeBreakpoint}
          activeId={selectedId}
          onSelect={() => undefined}
        />
      </div>
    );
  }, [activeDrag, activeBreakpoint, selectedId]);

  return (
    <div className={clsx("flex h-screen w-full bg-slate-100 dark:bg-graphite-900", isDark && "dark")}>
      <div className="flex h-full w-full flex-col">
        <Toolbar onToggleTheme={toggleTheme} />
        <div className="grid flex-1 grid-cols-[320px_minmax(0,1fr)_360px] bg-slate-50 dark:bg-graphite-900">
          <Panel title="Navigator">
            <NavigatorPanel />
            <div className="border-t border-slate-200 dark:border-graphite-600">
              <ComponentLibrary
                onInsert={(item) => addElement(null, cloneNode(item.template))}
              />
            </div>
          </Panel>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDropCancel}
          >
            <Canvas />
            <DragOverlay>{overlay}</DragOverlay>
          </DndContext>
          <Panel title="Settings">
            <SettingsPanel />
          </Panel>
        </div>
      </div>
      <aside className="sr-only" aria-live="polite">
        {selectedId ? `Selected element ${selectedId}` : "No element selected"}
      </aside>
    </div>
  );
};
