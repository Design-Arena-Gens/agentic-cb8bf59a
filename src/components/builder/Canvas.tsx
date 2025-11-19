"use client";

import { useMemo } from "react";
import { useDraggable, useDroppable, type UniqueIdentifier } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { clsx } from "clsx";
import { ElementRenderer } from "@/components/builder/ElementRenderer";
import { useBuilderStore } from "@/state/builder-store";
import type { ElementNode } from "@/types/builder";

type CanvasElementProps = {
  node: ElementNode;
  parentId: string | null;
};

const DroppablePlaceholder = ({
  parentId,
  position
}: {
  parentId: string | null;
  position: number;
}) => {
  const id = `${parentId ?? "root"}-placeholder-${position}` as UniqueIdentifier;
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "canvas-placeholder",
      parentId,
      index: position
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "my-2 h-3 rounded-full transition",
        isOver ? "bg-accent/60" : "bg-transparent"
      )}
    />
  );
};

const CanvasElement = ({ node, parentId }: CanvasElementProps) => {
  const activeBreakpoint = useBuilderStore((state) => state.activeBreakpoint);
  const selectedId = useBuilderStore((state) => state.selectedId);
  const setSelected = useBuilderStore((state) => state.setSelected);

  const { attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging } = useDraggable({
    id: node.id,
    data: {
      type: "canvas-element",
      node,
      parentId
    }
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `${node.id}-dropzone`,
    data: {
      type: "canvas-dropzone",
      parentId: node.id,
      acceptsChildren: true
    }
  });

  const combinedRef = (element: HTMLElement | null) => {
    setDraggableRef(element);
    setDroppableRef(element);
  };

  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.5 : 1,
    border: isOver ? "2px dashed rgba(78,141,255,0.8)" : undefined
  };

  return (
    <div ref={combinedRef} style={style} {...listeners} {...attributes} role="group">
      <ElementRenderer
        node={node}
        breakpoint={activeBreakpoint}
        activeId={selectedId}
        onSelect={setSelected}
      />
      {node.children.length > 0 ? (
        <div className="mt-3 space-y-2 pl-2">
          {node.children.map((child, index) => (
            <div key={child.id}>
              <DroppablePlaceholder parentId={node.id} position={index} />
              <CanvasElement node={child} parentId={node.id} />
            </div>
          ))}
          <DroppablePlaceholder parentId={node.id} position={node.children.length} />
        </div>
      ) : (
        <DroppablePlaceholder parentId={node.id} position={0} />
      )}
    </div>
  );
};

export const Canvas = () => {
  const elements = useBuilderStore((state) => state.elements);

  const rootPlaceholders = useMemo(
    () =>
      Array.from({ length: elements.length + 1 }, (_, index) => (
        <DroppablePlaceholder key={`root-${index}`} parentId={null} position={index} />
      )),
    [elements.length]
  );

  return (
    <div
      className="relative flex-1 overflow-auto bg-slate-100 px-6 py-6 dark:bg-graphite-900"
      role="presentation"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4">
        {elements.map((node, index) => (
          <div key={node.id}>
            {rootPlaceholders[index]}
            <CanvasElement node={node} parentId={null} />
          </div>
        ))}
        {rootPlaceholders[elements.length]}
      </div>
    </div>
  );
};
