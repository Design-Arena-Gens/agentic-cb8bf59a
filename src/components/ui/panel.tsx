import { forwardRef } from "react";
import { clsx } from "clsx";

type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  toolbar?: React.ReactNode;
};

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ className, title, children, toolbar, ...props }, ref) => (
    <section
      ref={ref}
      className={clsx(
        "flex h-full flex-col overflow-hidden border border-slate-200 bg-white shadow-sm transition dark:border-graphite-600 dark:bg-graphite-800",
        className
      )}
      {...props}
    >
      {(title || toolbar) && (
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-sm font-medium uppercase tracking-wide text-slate-500 dark:border-graphite-600">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {title}
          </span>
          {toolbar ? <div className="flex items-center gap-2">{toolbar}</div> : null}
        </header>
      )}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </section>
  )
);

Panel.displayName = "Panel";
