import { splitProps, type Component, type JSX } from "solid-js";
import { cn } from "@repo/utils";
import {
  badgeVariants,
  type BadgeVariant,
} from "../../../shared/variants/badge";

export interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge: Component<BadgeProps> = (props) => {
  const [local, others] = splitProps(props, ["variant", "class", "children"]);
  return (
    <span
      class={cn(badgeVariants({ variant: local.variant }), local.class)}
      {...others}
    >
      {local.children}
    </span>
  );
};
