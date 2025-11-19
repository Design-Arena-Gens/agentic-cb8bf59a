"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { clsx } from "clsx";
import { useBuilderStore } from "@/state/builder-store";
import type { BreakpointId, ElementNode } from "@/types/builder";

type StyleField = {
  label: string;
  property: keyof CSSProperties;
  type: "text" | "color" | "number" | "select";
  options?: { label: string; value: string }[];
  suffix?: string;
};

const TYPOGRAPHY_FIELDS: StyleField[] = [
  { label: "Font Size", property: "fontSize", type: "text" },
  {
    label: "Font Weight",
    property: "fontWeight",
    type: "select",
    options: [
      { label: "Default", value: "" },
      { label: "Medium", value: "500" },
      { label: "Semibold", value: "600" },
      { label: "Bold", value: "700" }
    ]
  },
  { label: "Line Height", property: "lineHeight", type: "text" },
  { label: "Letter Spacing", property: "letterSpacing", type: "text" },
  { label: "Text Align", property: "textAlign", type: "select", options: [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" }
  ] }
];

const LAYOUT_FIELDS: StyleField[] = [
  { label: "Display", property: "display", type: "select", options: [
    { label: "Default", value: "" },
    { label: "Flex", value: "flex" },
    { label: "Grid", value: "grid" },
    { label: "Block", value: "block" }
  ] },
  { label: "Flex Direction", property: "flexDirection", type: "select", options: [
    { label: "Row", value: "row" },
    { label: "Column", value: "column" }
  ] },
  { label: "Gap", property: "gap", type: "text" },
  { label: "Padding", property: "padding", type: "text" },
  { label: "Margin", property: "margin", type: "text" }
];

const BACKGROUND_FIELDS: StyleField[] = [
  { label: "Background Color", property: "backgroundColor", type: "color" },
  { label: "Gradient", property: "backgroundImage", type: "text" }
];

const BORDER_FIELDS: StyleField[] = [
  { label: "Border", property: "border", type: "text" },
  { label: "Border Radius", property: "borderRadius", type: "text" },
  { label: "Shadow", property: "boxShadow", type: "text" }
];

const RESPONSIVE_FIELDS: { label: string; property: keyof ElementNode }[] = [
  { label: "ARIA Label", property: "ariaLabel" },
  { label: "Alt Text", property: "altText" }
];

const TabButton = ({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={clsx(
      "rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wide transition focus-visible:outline focus-visible:outline-accent",
      active
        ? "bg-accent text-white shadow"
        : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-graphite-700"
    )}
  >
    {label}
  </button>
);

const StyleGroup = ({
  title,
  fields,
  node,
  breakpoint,
  onChange
}: {
  title: string;
  fields: StyleField[];
  node: ElementNode;
  breakpoint: BreakpointId;
  onChange: (property: keyof CSSProperties, value: string) => void;
}) => {
  const currentStyle = node.responsiveStyle[breakpoint] ?? {};
  return (
    <section aria-label={title} className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
        {title}
      </h3>
      <div className="space-y-2">
        {fields.map((field) => {
          const value = (currentStyle[field.property] as string) ?? "";
          return (
            <label
              key={field.property as string}
              className="flex flex-col gap-1 rounded-md border border-slate-200 bg-white p-2 text-xs dark:border-graphite-500 dark:bg-graphite-700"
            >
              <span className="font-medium text-slate-500 dark:text-slate-300">
                {field.label}
              </span>
              {field.type === "select" && field.options ? (
                <select
                  value={value}
                  onChange={(event) => onChange(field.property, event.target.value)}
                  className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 focus-visible:outline focus-visible:outline-accent dark:border-graphite-500 dark:bg-graphite-800 dark:text-slate-200"
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={value}
                  onChange={(event) => onChange(field.property, event.target.value)}
                  className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 focus-visible:outline focus-visible:outline-accent dark:border-graphite-500 dark:bg-graphite-800 dark:text-slate-200"
                />
              )}
            </label>
          );
        })}
      </div>
    </section>
  );
};

export const SettingsPanel = () => {
  const [activeTab, setActiveTab] = useState<"style" | "seo" | "integrations">("style");
  const selectedId = useBuilderStore((state) => state.selectedId);
  const elements = useBuilderStore((state) => state.elements);
  const activeBreakpoint = useBuilderStore((state) => state.activeBreakpoint);
  const updateElement = useBuilderStore((state) => state.updateElement);
  const setPageMeta = useBuilderStore((state) => state.setPageMeta);
  const pageMeta = useBuilderStore((state) => state.pageMeta);
  const setIntegrations = useBuilderStore((state) => state.setIntegrations);
  const integrations = useBuilderStore((state) => state.integrations);

  const selectedNode = useMemo(() => {
    const queue = [...elements];
    while (queue.length) {
      const node = queue.shift()!;
      if (node.id === selectedId) {
        return node;
      }
      queue.push(...node.children);
    }
    return null;
  }, [elements, selectedId]);

  const handleStyleChange = (
    property: keyof CSSProperties,
    value: string,
    breakpoint: BreakpointId
  ) => {
    if (!selectedNode) {
      return;
    }
    updateElement(selectedNode.id, (node) => {
      const updated = { ...node };
      updated.responsiveStyle = {
        ...updated.responsiveStyle,
        [breakpoint]: {
          ...updated.responsiveStyle[breakpoint],
          [property]: value
        }
      };
      return updated;
    });
  };

  const handleMetaChange = (field: keyof typeof pageMeta, value: string) => {
    setPageMeta({ [field]: value } as Partial<typeof pageMeta>);
  };

  const handleNodeMetaChange = (property: keyof ElementNode, value: string) => {
    if (!selectedNode) return;
    updateElement(selectedNode.id, (node) => ({
      ...node,
      [property]: value
    }));
  };

  const handleIntegrationChange = (
    group: keyof typeof integrations,
    key: string,
    value: boolean
  ) => {
    setIntegrations({
      [group]: {
        [key]: value
      }
    } as Partial<typeof integrations>);
  };

  if (!selectedNode) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-300">
        Select an element to adjust its settings.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-graphite-600">
        <TabButton label="Style" active={activeTab === "style"} onClick={() => setActiveTab("style")} />
        <TabButton label="SEO" active={activeTab === "seo"} onClick={() => setActiveTab("seo")} />
        <TabButton
          label="Integrations"
          active={activeTab === "integrations"}
          onClick={() => setActiveTab("integrations")}
        />
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === "style" ? (
          <div className="space-y-5">
            <header>
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {selectedNode.label}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-400">
                Editing for {activeBreakpoint} breakpoint
              </p>
            </header>
            <StyleGroup
              title="Typography"
              fields={TYPOGRAPHY_FIELDS}
              node={selectedNode}
              breakpoint={activeBreakpoint}
              onChange={(property, value) => handleStyleChange(property, value, activeBreakpoint)}
            />
            <StyleGroup
              title="Layout"
              fields={LAYOUT_FIELDS}
              node={selectedNode}
              breakpoint={activeBreakpoint}
              onChange={(property, value) => handleStyleChange(property, value, activeBreakpoint)}
            />
            <StyleGroup
              title="Background"
              fields={BACKGROUND_FIELDS}
              node={selectedNode}
              breakpoint={activeBreakpoint}
              onChange={(property, value) => handleStyleChange(property, value, activeBreakpoint)}
            />
            <StyleGroup
              title="Borders & Shadows"
              fields={BORDER_FIELDS}
              node={selectedNode}
              breakpoint={activeBreakpoint}
              onChange={(property, value) => handleStyleChange(property, value, activeBreakpoint)}
            />
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Accessibility
              </h3>
              <div className="space-y-2">
                {RESPONSIVE_FIELDS.map((field) => (
                  <label
                    key={field.property as string}
                    className="flex flex-col gap-1 rounded-md border border-slate-200 bg-white p-2 text-xs dark:border-graphite-500 dark:bg-graphite-700"
                  >
                    <span className="font-medium text-slate-500 dark:text-slate-300">
                      {field.label}
                    </span>
                    <input
                      type="text"
                      value={(selectedNode[field.property] as string) ?? ""}
                      onChange={(event) => handleNodeMetaChange(field.property, event.target.value)}
                      className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 focus-visible:outline focus-visible:outline-accent dark:border-graphite-500 dark:bg-graphite-800 dark:text-slate-200"
                    />
                  </label>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        {activeTab === "seo" ? (
          <div className="space-y-4">
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Page Metadata
              </h3>
              <label className="flex flex-col gap-1 text-xs">
                <span className="font-medium text-slate-500 dark:text-slate-300">Title</span>
                <input
                  value={pageMeta.title}
                  onChange={(event) => handleMetaChange("title", event.target.value)}
                  className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 dark:border-graphite-500 dark:bg-graphite-700 dark:text-slate-200"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span className="font-medium text-slate-500 dark:text-slate-300">Meta Description</span>
                <textarea
                  value={pageMeta.description}
                  onChange={(event) => handleMetaChange("description", event.target.value)}
                  className="min-h-[80px] rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 dark:border-graphite-500 dark:bg-graphite-700 dark:text-slate-200"
                />
              </label>
            </section>
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Custom Code Injection
              </h3>
              <label className="flex flex-col gap-1 text-xs">
                <span className="font-medium text-slate-500 dark:text-slate-300">Custom Head HTML</span>
                <textarea
                  value={pageMeta.customHeadHTML}
                  onChange={(event) => handleMetaChange("customHeadHTML", event.target.value)}
                  className="min-h-[120px] rounded border border-slate-200 px-2 py-1 font-mono text-xs text-slate-600 dark:border-graphite-500 dark:bg-graphite-700 dark:text-slate-200"
                  placeholder="<style>...</style>"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span className="font-medium text-slate-500 dark:text-slate-300">
                  Custom Body Scripts
                </span>
                <textarea
                  value={pageMeta.customBodyScripts}
                  onChange={(event) => handleMetaChange("customBodyScripts", event.target.value)}
                  className="min-h-[120px] rounded border border-slate-200 px-2 py-1 font-mono text-xs text-slate-600 dark:border-graphite-500 dark:bg-graphite-700 dark:text-slate-200"
                  placeholder="<script>...</script>"
                />
              </label>
            </section>
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Asset Accessibility
              </h3>
              <label className="flex flex-col gap-1 text-xs">
                <span className="font-medium text-slate-500 dark:text-slate-300">Alt Text</span>
                <input
                  value={selectedNode.altText ?? ""}
                  onChange={(event) => handleNodeMetaChange("altText", event.target.value)}
                  className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 dark:border-graphite-500 dark:bg-graphite-700 dark:text-slate-200"
                />
              </label>
            </section>
          </div>
        ) : null}

        {activeTab === "integrations" ? (
          <div className="space-y-4">
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                CMS Integrations
              </h3>
              <ul className="mt-2 space-y-2">
                {Object.entries(integrations.cms).map(([key, value]) => (
                  <li key={key} className="flex items-center justify-between text-xs">
                    <span className="capitalize text-slate-500 dark:text-slate-300">{key}</span>
                    <label className="inline-flex items-center gap-2">
                      <span className="sr-only">Toggle {key}</span>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(event) =>
                          handleIntegrationChange("cms", key, event.target.checked)
                        }
                        className="h-4 w-4 rounded border-slate-300 text-accent focus-visible:outline focus-visible:outline-accent"
                      />
                    </label>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                E-commerce Integrations
              </h3>
              <ul className="mt-2 space-y-2">
                {Object.entries(integrations.ecommerce).map(([key, value]) => (
                  <li key={key} className="flex items-center justify-between text-xs">
                    <span className="capitalize text-slate-500 dark:text-slate-300">{key}</span>
                    <label className="inline-flex items-center gap-2">
                      <span className="sr-only">Toggle {key}</span>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(event) =>
                          handleIntegrationChange("ecommerce", key, event.target.checked)
                        }
                        className="h-4 w-4 rounded border-slate-300 text-accent focus-visible:outline focus-visible:outline-accent"
                      />
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
};
