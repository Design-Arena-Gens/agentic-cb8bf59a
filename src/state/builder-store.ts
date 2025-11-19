import { nanoid } from "nanoid";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  BreakpointId,
  BuilderState,
  ElementNode,
  IntegrationSettings,
  PageMeta
} from "@/types/builder";

type HistoryEntry = {
  elements: ElementNode[];
  pageMeta: PageMeta;
  integrations: IntegrationSettings;
};

type BuilderActions = {
  setSelected: (id: string | null) => void;
  setActiveBreakpoint: (breakpoint: BreakpointId) => void;
  addElement: (parentId: string | null, element: ElementNode, index?: number) => void;
  updateElement: (id: string, updater: (node: ElementNode) => ElementNode) => void;
  removeElement: (id: string) => void;
  moveElement: (id: string, targetParentId: string | null, index: number) => void;
  setPageMeta: (meta: Partial<PageMeta>) => void;
  setIntegrations: (integrations: Partial<IntegrationSettings>) => void;
  undo: () => void;
  redo: () => void;
};

type StoreState = BuilderState &
  BuilderActions & {
    canUndo: boolean;
    canRedo: boolean;
    past: HistoryEntry[];
    future: HistoryEntry[];
  };

const emptyResponsiveStyle = (): ElementNode["responsiveStyle"] => ({
  desktop: {},
  tablet: {},
  mobile: {}
});

const withGeneratedIds = (node: ElementNode): ElementNode => ({
  ...node,
  id: node.id ?? nanoid(),
  children: node.children.map(withGeneratedIds)
});

const defaultElementsSeed = [
  {
    id: nanoid(),
    label: "Hero Section",
    kind: "hero" as const,
    props: {
      heading: "Design visually, build for production.",
      description:
        "Compose responsive pages with a powerful no-code builder that respects accessibility and performance."
    },
    ariaLabel: "Hero section",
    children: [
      {
        id: nanoid(),
        label: "Primary CTA",
        kind: "button" as const,
        props: {
          text: "Get Started",
          variant: "primary"
        },
        responsiveStyle: emptyResponsiveStyle(),
        children: []
      }
    ],
    responsiveStyle: {
      desktop: {
        padding: "64px",
        gap: "32px"
      },
      tablet: {
        padding: "48px",
        gap: "24px"
      },
      mobile: {
        padding: "32px",
        gap: "16px"
      }
    }
  },
  {
    id: nanoid(),
    label: "Feature Section",
    kind: "section" as const,
    props: {},
    ariaLabel: "Feature grid",
    responsiveStyle: {
      desktop: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "24px",
        padding: "64px"
      },
      tablet: {
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        padding: "48px"
      },
      mobile: {
        gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
        padding: "32px"
      }
    },
    children: [
      {
        id: nanoid(),
        label: "Card",
        kind: "card" as const,
        props: {
          heading: "CMS Integrations",
          text: "Sync content seamlessly with Contentful, Sanity, or Notion."
        },
        responsiveStyle: emptyResponsiveStyle(),
        children: []
      },
      {
        id: nanoid(),
        label: "Card",
        kind: "card" as const,
        props: {
          heading: "Commerce Ready",
          text: "Embed Shopify, Stripe, or Snipcart for frictionless checkout."
        },
        responsiveStyle: emptyResponsiveStyle(),
        children: []
      },
      {
        id: nanoid(),
        label: "Card",
        kind: "card" as const,
        props: {
          heading: "Production CSS",
          text: "Fine-grained control over typography, layout, and interactions."
        },
        responsiveStyle: emptyResponsiveStyle(),
        children: []
      }
    ]
  },
  {
    id: nanoid(),
    label: "Footer",
    kind: "footer" as const,
    props: {
      copyright: "© 2025 Aurora Studio. Crafted with care."
    },
    ariaLabel: "Page footer",
    responsiveStyle: {
      desktop: {
        padding: "48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      },
      tablet: {
        padding: "32px",
        flexDirection: "column",
        gap: "16px"
      },
      mobile: {
        padding: "24px",
        flexDirection: "column",
        gap: "12px"
      }
    },
    children: []
  }
] satisfies ElementNode[];

const defaultElements: ElementNode[] = defaultElementsSeed.map(withGeneratedIds);

const defaultPageMeta: PageMeta = {
  title: "Landing Page",
  description: "High-performance landing page built visually.",
  customHeadHTML: "",
  customBodyScripts: ""
};

const defaultIntegrations: IntegrationSettings = {
  cms: {
    contentful: true,
    sanity: false,
    notion: false
  },
  ecommerce: {
    shopify: true,
    stripe: true,
    snipcart: false
  }
};

const cloneNodeTree = (nodes: ElementNode[]): ElementNode[] =>
  nodes.map((node) => ({
    ...node,
    props: { ...node.props },
    responsiveStyle: {
      desktop: { ...node.responsiveStyle.desktop },
      tablet: { ...node.responsiveStyle.tablet },
      mobile: { ...node.responsiveStyle.mobile }
    },
    children: cloneNodeTree(node.children)
  }));

const createSnapshot = (state: StoreState): HistoryEntry => ({
  elements: cloneNodeTree(state.elements),
  pageMeta: { ...state.pageMeta },
  integrations: JSON.parse(JSON.stringify(state.integrations))
});

const removeNodeById = (nodes: ElementNode[], id: string): ElementNode[] =>
  nodes
    .filter((node) => node.id !== id)
    .map((node) => ({ ...node, children: removeNodeById(node.children, id) }));

const insertNode = (
  nodes: ElementNode[],
  targetParentId: string | null,
  node: ElementNode,
  index: number
): ElementNode[] => {
  if (!targetParentId) {
    const root = cloneNodeTree(nodes);
    const safeIndex = Math.max(0, Math.min(index, root.length));
    root.splice(safeIndex, 0, node);
    return root;
  }

  return nodes.map((existing) => {
    if (existing.id === targetParentId) {
      const clonedChildren = cloneNodeTree(existing.children);
      const safeIndex = Math.max(0, Math.min(index, clonedChildren.length));
      clonedChildren.splice(safeIndex, 0, node);
      return {
        ...existing,
        children: clonedChildren
      };
    }
    return {
      ...existing,
      children: insertNode(existing.children, targetParentId, node, index)
    };
  });
};

const updateNode = (
  nodes: ElementNode[],
  id: string,
  updater: (node: ElementNode) => ElementNode
): ElementNode[] =>
  nodes.map((node) => {
    if (node.id === id) {
      return updater({
        ...node,
        children: updateNode(node.children, id, updater)
      });
    }
    return {
      ...node,
      children: updateNode(node.children, id, updater)
    };
  });

const findNode = (
  nodes: ElementNode[],
  id: string,
  parentId: string | null = null
): { node: ElementNode; parentId: string | null; index: number } | null => {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (node.id === id) {
      return { node, parentId, index };
    }
    const child = findNode(node.children, id, node.id);
    if (child) {
      return child;
    }
  }
  return null;
};

const historyLimit = 50;

const pushHistory = (history: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] => {
  const next = [...history, entry];
  if (next.length > historyLimit) {
    next.shift();
  }
  return next;
};

const initialState: StoreState = {
  elements: cloneNodeTree(defaultElements),
  selectedId: defaultElements[0]?.id ?? null,
  activeBreakpoint: "desktop",
  pageMeta: { ...defaultPageMeta },
  integrations: JSON.parse(JSON.stringify(defaultIntegrations)),
  canUndo: false,
  canRedo: false,
  past: [],
  future: [],
  setSelected: () => undefined,
  setActiveBreakpoint: () => undefined,
  addElement: () => undefined,
  updateElement: () => undefined,
  removeElement: () => undefined,
  moveElement: () => undefined,
  setPageMeta: () => undefined,
  setIntegrations: () => undefined,
  undo: () => undefined,
  redo: () => undefined
};

export const useBuilderStore = create<StoreState>()(
  devtools((set, get) => {
    const setWithHistory = (updater: (state: StoreState) => Partial<StoreState>) => {
      set((state) => {
        const nextPartial = updater(state);
        const snapshot = createSnapshot(state);
        const past = pushHistory(state.past, snapshot);
        return {
          ...state,
          ...nextPartial,
          past,
          future: [],
          canUndo: past.length > 0,
          canRedo: false
        };
      });
    };

    return {
      ...initialState,

      setSelected: (selectedId) => set({ selectedId }),

      setActiveBreakpoint: (activeBreakpoint) => set({ activeBreakpoint }),

      addElement: (parentId, element, index = Number.MAX_SAFE_INTEGER) => {
        const node = withGeneratedIds(element);
        setWithHistory((state) => ({
          elements: insertNode(state.elements, parentId, node, index),
          selectedId: node.id
        }));
      },

      updateElement: (id, updater) => {
        setWithHistory((state) => ({
          elements: updateNode(state.elements, id, updater)
        }));
      },

      removeElement: (id) => {
        setWithHistory((state) => {
          const nextElements = removeNodeById(state.elements, id);
          const selectedId = state.selectedId === id ? nextElements[0]?.id ?? null : state.selectedId;
          return {
            elements: nextElements,
            selectedId
          };
        });
      },

      moveElement: (id, targetParentId, index) => {
        const state = get();
        const found = findNode(state.elements, id);
        if (!found) {
          return;
        }
        const without = removeNodeById(state.elements, id);
        const inserted = insertNode(without, targetParentId, found.node, index);
        setWithHistory(() => ({
          elements: inserted
        }));
      },

      setPageMeta: (meta) => {
        setWithHistory((state) => ({
          pageMeta: { ...state.pageMeta, ...meta }
        }));
      },

      setIntegrations: (integrations) => {
        setWithHistory((state) => ({
          integrations: {
            cms: { ...state.integrations.cms, ...integrations.cms },
            ecommerce: { ...state.integrations.ecommerce, ...integrations.ecommerce }
          }
        }));
      },

      undo: () => {
        set((state) => {
          if (state.past.length === 0) {
            return state;
          }
          const past = [...state.past];
          const previous = past.pop()!;
          const future = pushHistory(state.future, createSnapshot(state));
          return {
            ...state,
            elements: cloneNodeTree(previous.elements),
            pageMeta: { ...previous.pageMeta },
            integrations: JSON.parse(JSON.stringify(previous.integrations)),
            past,
            future,
            canUndo: past.length > 0,
            canRedo: future.length > 0
          };
        });
      },

      redo: () => {
        set((state) => {
          if (state.future.length === 0) {
            return state;
          }
          const future = [...state.future];
          const next = future.pop()!;
          const past = pushHistory(state.past, createSnapshot(state));
          return {
            ...state,
            elements: cloneNodeTree(next.elements),
            pageMeta: { ...next.pageMeta },
            integrations: JSON.parse(JSON.stringify(next.integrations)),
            past,
            future,
            canUndo: past.length > 0,
            canRedo: future.length > 0
          };
        });
      }
    };
  })
);
