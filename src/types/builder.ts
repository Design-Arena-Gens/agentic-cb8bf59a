import type { CSSProperties } from "react";

export type BreakpointId = "desktop" | "tablet" | "mobile";

export type ElementKind =
  | "section"
  | "container"
  | "heading"
  | "paragraph"
  | "button"
  | "image"
  | "form"
  | "input"
  | "navbar"
  | "carousel"
  | "card"
  | "hero"
  | "footer";

export type ResponsiveStyle = {
  [K in BreakpointId]: Partial<CSSProperties>;
};

export type ElementNode = {
  id: string;
  label: string;
  kind: ElementKind;
  props: Record<string, unknown>;
  children: ElementNode[];
  responsiveStyle: ResponsiveStyle;
  ariaLabel?: string;
  altText?: string;
};

export type PageMeta = {
  title: string;
  description: string;
  customHeadHTML: string;
  customBodyScripts: string;
};

export type IntegrationSettings = {
  cms: {
    contentful: boolean;
    sanity: boolean;
    notion: boolean;
  };
  ecommerce: {
    shopify: boolean;
    stripe: boolean;
    snipcart: boolean;
  };
};

export type BuilderState = {
  elements: ElementNode[];
  selectedId: string | null;
  activeBreakpoint: BreakpointId;
  pageMeta: PageMeta;
  integrations: IntegrationSettings;
};
