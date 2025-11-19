import { nanoid } from "nanoid";
import type { ElementNode } from "@/types/builder";

export type LibraryItem = {
  id: string;
  name: string;
  description: string;
  preview: string;
  template: ElementNode;
  category: "Layout" | "Content" | "Components";
};

const baseStyle = () => ({
  desktop: {},
  tablet: {},
  mobile: {}
});

const textBlock = (label: string, kind: ElementNode["kind"], textKey: string, text: string) => ({
  id: nanoid(),
  label,
  kind,
  props: { [textKey]: text },
  children: [],
  responsiveStyle: baseStyle()
});

export const COMPONENT_LIBRARY: LibraryItem[] = [
  {
    id: "button",
    name: "Primary Button",
    description: "Call-to-action button with accessible contrast.",
    preview: "Button",
    category: "Components",
    template: {
      id: nanoid(),
      label: "Button",
      kind: "button",
      props: {
        text: "Click Me",
        variant: "primary"
      },
      children: [],
      responsiveStyle: baseStyle()
    }
  },
  {
    id: "navbar",
    name: "Navbar",
    description: "Responsive navigation with brand and links.",
    preview: "Navbar",
    category: "Layout",
    template: {
      id: nanoid(),
      label: "Navbar",
      kind: "navbar",
      props: {
        brand: "Aurora",
        links: ["Features", "Templates", "Pricing", "Contact"]
      },
      children: [],
      responsiveStyle: baseStyle()
    }
  },
  {
    id: "form",
    name: "Lead Form",
    description: "Form with name, email, and message fields.",
    preview: "Form",
    category: "Components",
    template: {
      id: nanoid(),
      label: "Form",
      kind: "form",
      props: {
        fields: [
          { name: "name", label: "Full Name", type: "text" },
          { name: "email", label: "Email address", type: "email" }
        ],
        submitText: "Request demo"
      },
      children: [],
      responsiveStyle: baseStyle()
    }
  },
  {
    id: "carousel",
    name: "Carousel",
    description: "Autoplay hero carousel with slides.",
    preview: "Carousel",
    category: "Components",
    template: {
      id: nanoid(),
      label: "Carousel",
      kind: "carousel",
      props: {
        slides: [
          { heading: "Design once", subheading: "Adapt layouts by breakpoint." },
          { heading: "Accessibility", subheading: "WCAG compliant by default." }
        ]
      },
      children: [],
      responsiveStyle: baseStyle()
    }
  },
  {
    id: "hero",
    name: "Hero Template",
    description: "Hero with heading, subheading, and CTA.",
    preview: "Hero",
    category: "Content",
    template: {
      id: nanoid(),
      label: "Hero",
      kind: "hero",
      ariaLabel: "Hero section with call to action",
      props: {
        heading: "Craft immersive experiences",
        description: "Leverage a modern visual builder with production-ready output."
      },
      children: [
        {
          id: nanoid(),
          label: "CTA",
          kind: "button",
          props: {
            text: "Explore Templates",
            variant: "primary"
          },
          children: [],
          responsiveStyle: baseStyle()
        }
      ],
      responsiveStyle: {
        desktop: { padding: "120px 64px", gap: "24px" },
        tablet: { padding: "96px 48px", gap: "20px" },
        mobile: { padding: "72px 24px", gap: "16px" }
      }
    }
  },
  {
    id: "text-block",
    name: "Text Block",
    description: "Heading and paragraph combination.",
    preview: "Text",
    category: "Content",
    template: {
      id: nanoid(),
      label: "Content Block",
      kind: "section",
      props: {},
      children: [
        textBlock("Heading", "heading", "text", "Design visually."),
        textBlock("Paragraph", "paragraph", "text", "Ship faster with a visual builder.")
      ],
      responsiveStyle: baseStyle()
    }
  }
];
