import { forwardRef } from "react";
import { clsx } from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-md font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary: "bg-accent text-white hover:bg-accent-soft disabled:bg-accent/60",
      secondary:
        "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:text-slate-400 dark:border-graphite-500 dark:bg-graphite-700 dark:text-slate-200",
      ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-graphite-700"
    };

    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
      sm: "px-2.5 py-1.5 text-xs",
      md: "px-3.5 py-2 text-sm"
    };

    return (
      <button
        ref={ref}
        className={clsx(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
