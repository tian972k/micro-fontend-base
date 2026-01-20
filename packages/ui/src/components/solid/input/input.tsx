import { splitProps, JSX, Component } from "solid-js";
import { cn } from "@repo/utils";
import { inputClasses } from "../../../shared/variants/input";

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {}

export const Input: Component<InputProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "type"]);

  return (
    <input
      type={local.type ?? "text"}
      class={cn(inputClasses.base, local.class)}
      {...others}
    />
  );
};
