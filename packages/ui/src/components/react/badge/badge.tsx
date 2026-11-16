import * as React from "react";
import { cn } from "@repo/utils";
import {
  badgeVariants,
  type BadgeVariant,
} from "../../../shared/variants/badge";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
