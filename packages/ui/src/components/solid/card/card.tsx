import { splitProps, JSX, Component, mergeProps } from "solid-js";
import { cn } from "@repo/utils";
import { cardClasses } from "../../../shared/variants/card";

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  gradient?: boolean;
}

export const Card: Component<CardProps> = (props) => {
  const merged = mergeProps({ gradient: false }, props);
  const [local, others] = splitProps(merged, ["gradient", "class", "children"]);

  return (
    <div
      class={cn(
        cardClasses.root,
        local.gradient && cardClasses.rootGradient,
        local.class,
      )}
      {...others}
    >
      {local.children}
    </div>
  );
};

export const CardHeader: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
  props,
) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <div class={cn(cardClasses.header, local.class)} {...others}>
      {local.children}
    </div>
  );
};

export const CardTitle: Component<JSX.HTMLAttributes<HTMLHeadingElement>> = (
  props,
) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <h3 class={cn(cardClasses.title, local.class)} {...others}>
      {local.children}
    </h3>
  );
};

export const CardDescription: Component<
  JSX.HTMLAttributes<HTMLParagraphElement>
> = (props) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <p class={cn(cardClasses.description, local.class)} {...others}>
      {local.children}
    </p>
  );
};

export const CardContent: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
  props,
) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <div class={cn(cardClasses.content, local.class)} {...others}>
      {local.children}
    </div>
  );
};

export const CardFooter: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
  props,
) => {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <div class={cn(cardClasses.footer, local.class)} {...others}>
      {local.children}
    </div>
  );
};
