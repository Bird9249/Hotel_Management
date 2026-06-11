import type { ReactNode } from "react";
import { ScrollArea } from "@/components/kit";
import { cn } from "@/lib/utils";

type DialogScrollBodyProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

/**
 * Scrollable dialog body. Parent DialogContent should use:
 * `grid max-h-[min(90vh,720px)] grid-rows-[auto_minmax(0,1fr)]`
 */
export function DialogScrollBody({
  children,
  className,
  contentClassName,
}: DialogScrollBodyProps) {
  return (
    <ScrollArea className={cn("min-h-0", className)}>
      <div className={cn("px-6 py-4", contentClassName)}>{children}</div>
    </ScrollArea>
  );
}
