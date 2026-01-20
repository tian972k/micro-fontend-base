import { splitProps, JSX, Component, mergeProps } from "solid-js";
import { cn } from "@repo/utils";
import {
  buttonVariants,
  type ButtonVariant,
  type ButtonSize,
} from "../../../shared/variants/button";

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button: Component<ButtonProps> = (props) => {
  const merged = mergeProps(
    { variant: "default" as ButtonVariant, size: "default" as ButtonSize },
    props,
  );
  const [local, others] = splitProps(merged, [
    "variant",
    "size",
    "class",
    "children",
  ]);

  return (
    <button
      class={cn(
        buttonVariants({ variant: local.variant, size: local.size }),
        local.class,
      )}
      {...others}
    >
      {local.children}
    </button>
  );
};
