"use client";

import { Fragment } from "react";
import { clsx } from "clsx";
import type { BreakpointId, ElementNode } from "@/types/builder";

type ElementRendererProps = {
  node: ElementNode;
  breakpoint: BreakpointId;
  activeId: string | null;
  onSelect: (id: string) => void;
};

const baseClass =
  "relative cursor-pointer rounded-md border border-transparent p-4 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-graphite-900";

export const ElementRenderer = ({
  node,
  breakpoint,
  activeId,
  onSelect
}: ElementRendererProps) => {
  const style = node.responsiveStyle[breakpoint] ?? {};
  const isActive = node.id === activeId;

  const handleSelect = (event: React.MouseEvent) => {
    event.stopPropagation();
    onSelect(node.id);
  };

  const renderChildren = () =>
    node.children.map((child) => (
      <ElementRenderer
        key={child.id}
        node={child}
        breakpoint={breakpoint}
        activeId={activeId}
        onSelect={onSelect}
      />
    ));

  switch (node.kind) {
    case "hero":
      return (
        <section
          role="region"
          aria-label={node.ariaLabel}
          tabIndex={0}
          className={clsx(
            baseClass,
            "flex flex-col gap-4 rounded-xl bg-gradient-to-tr from-accent/10 via-white to-white shadow-smooth dark:from-accent/20 dark:via-graphite-700 dark:to-graphite-700",
            isActive && "border-accent ring-2 ring-accent"
          )}
          style={style}
          onClick={handleSelect}
        >
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            {node.props.heading as string}
          </h1>
          <p className="max-w-xl text-base text-slate-500 dark:text-slate-300">
            {node.props.description as string}
          </p>
          {renderChildren()}
        </section>
      );
    case "section":
    case "container":
      return (
        <section
          role="region"
          aria-label={node.ariaLabel}
          tabIndex={0}
          className={clsx(
            baseClass,
            "flex flex-col gap-4 rounded-lg bg-white/60 dark:bg-graphite-700/50",
            isActive && "border-accent ring-2 ring-accent"
          )}
          style={style}
          onClick={handleSelect}
        >
          {renderChildren()}
        </section>
      );
    case "heading":
      return (
        <h2
          tabIndex={0}
          className={clsx(
            baseClass,
            "p-0 text-2xl font-semibold text-slate-900 dark:text-white",
            isActive && "border-accent ring-2 ring-accent"
          )}
          style={style}
          onClick={handleSelect}
        >
          {node.props.text as string}
        </h2>
      );
    case "paragraph":
      return (
        <p
          tabIndex={0}
          className={clsx(
            baseClass,
            "p-0 text-base text-slate-500 dark:text-slate-300",
            isActive && "border-accent ring-2 ring-accent"
          )}
          style={style}
          onClick={handleSelect}
        >
          {node.props.text as string}
        </p>
      );
    case "button": {
      const variant = (node.props.variant as string) ?? "primary";
      const variants = {
        primary: "bg-accent text-white hover:bg-accent-soft",
        secondary:
          "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-graphite-500 dark:bg-graphite-700 dark:text-slate-200",
        ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-graphite-700"
      };
      return (
        <button
          type="button"
          tabIndex={0}
          className={clsx(
            baseClass,
            "inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold",
            variants[variant as keyof typeof variants],
            isActive && "border-accent ring-2 ring-accent"
          )}
          style={style}
          onClick={handleSelect}
        >
          {node.props.text as string}
        </button>
      );
    }
    case "form": {
      const fields =
        (node.props.fields as Array<{ name: string; label: string; type: string }>) ?? [];
      return (
        <form
          role="form"
          aria-label={node.ariaLabel}
          tabIndex={0}
          className={clsx(
            baseClass,
            "rounded-xl border border-slate-200 bg-white/80 p-6 dark:border-graphite-500 dark:bg-graphite-700/80",
            isActive && "border-accent ring-2 ring-accent"
          )}
          style={style}
          onClick={handleSelect}
        >
          <div className="grid gap-4">
            {fields.map((field) => (
              <label key={field.name} className="flex flex-col text-sm">
                <span className="mb-2 font-medium text-slate-600 dark:text-slate-200">
                  {field.label}
                </span>
                <input
                  disabled
                  className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 shadow-sm dark:border-graphite-500 dark:bg-graphite-800 dark:text-slate-200"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  type={field.type}
                />
              </label>
            ))}
            <button
              type="button"
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              {(node.props.submitText as string) ?? "Submit"}
            </button>
          </div>
        </form>
      );
    }
    case "navbar": {
      const links = (node.props.links as string[]) ?? [];
      return (
        <nav
          aria-label="Primary navigation"
          tabIndex={0}
          className={clsx(
            baseClass,
            "flex items-center justify-between rounded-xl bg-white/70 px-6 py-4 shadow dark:bg-graphite-700/60",
            isActive && "border-accent ring-2 ring-accent"
          )}
          style={style}
          onClick={handleSelect}
        >
          <span className="text-lg font-semibold text-slate-800 dark:text-white">
            {node.props.brand as string}
          </span>
          <ul className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-300">
            {links.map((link) => (
              <li key={link}>
                <a href="#" className="hover:text-accent focus-visible:text-accent">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      );
    }
    case "carousel": {
      const slides =
        (node.props.slides as Array<{ heading: string; subheading: string }>) ?? [];
      return (
        <section
          role="region"
          aria-roledescription="carousel"
          tabIndex={0}
          className={clsx(
            baseClass,
            "overflow-hidden rounded-xl border border-slate-200 bg-white/70 shadow-sm dark:border-graphite-600 dark:bg-graphite-700/80",
            isActive && "border-accent ring-2 ring-accent"
          )}
          style={style}
          onClick={handleSelect}
        >
          <div className="flex flex-col gap-6">
            {slides.map((slide, index) => (
              <article key={slide.heading} className="rounded-lg bg-accent/10 p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  Slide {index + 1}
                </p>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                  {slide.heading}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {slide.subheading}
                </p>
              </article>
            ))}
          </div>
        </section>
      );
    }
    case "card":
      return (
        <article
          tabIndex={0}
          className={clsx(
            baseClass,
            "rounded-xl border border-slate-200 bg-white/80 p-6 shadow-sm transition hover:shadow-md dark:border-graphite-500 dark:bg-graphite-700/70",
            isActive && "border-accent ring-2 ring-accent"
          )}
          style={style}
          onClick={handleSelect}
        >
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            {node.props.heading as string}
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            {node.props.text as string}
          </p>
        </article>
      );
    case "footer":
      return (
        <footer
          tabIndex={0}
          className={clsx(
            baseClass,
            "rounded-xl bg-white/60 dark:bg-graphite-700/60",
            isActive && "border-accent ring-2 ring-accent"
          )}
          style={style}
          onClick={handleSelect}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 text-sm text-slate-500 dark:text-slate-300">
            <span>{node.props.copyright as string}</span>
            <nav aria-label="Footer navigation">
              <ul className="flex gap-4">
                <li>
                  <a href="#" className="hover:text-accent focus-visible:text-accent">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent focus-visible:text-accent">
                    Terms
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </footer>
      );
    case "image":
      return (
        <figure
          tabIndex={0}
          aria-label={node.ariaLabel}
          className={clsx(
            baseClass,
            "rounded-xl border border-dashed border-slate-300 bg-slate-100/70 p-0 dark:border-graphite-500 dark:bg-graphite-700/60",
            isActive && "border-accent ring-2 ring-accent"
          )}
          onClick={handleSelect}
          style={style}
        >
          <img
            src={(node.props.src as string) ?? "https://placehold.co/800x400/4E8DFF/FFF"}
            alt={(node.altText as string) ?? "Placeholder image"}
            className="h-full w-full rounded-xl object-cover"
          />
        </figure>
      );
    default:
      return <Fragment>{renderChildren()}</Fragment>;
  }
};
