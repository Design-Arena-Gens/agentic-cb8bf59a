import type { BreakpointId } from "@/types/builder";

export const BREAKPOINTS: Record<BreakpointId, { label: string; width: number }> = {
  desktop: { label: "Desktop", width: 1200 },
  tablet: { label: "Tablet", width: 834 },
  mobile: { label: "Mobile", width: 428 }
};
