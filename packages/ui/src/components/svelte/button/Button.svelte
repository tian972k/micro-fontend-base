<script lang="ts">
  import { cn } from "@repo/utils";
  import { buttonVariants, type ButtonVariant, type ButtonSize } from "../../../shared/variants/button";

  export let variant: ButtonVariant = "default";
  export let size: ButtonSize = "default";
  let className = "";
  export { className as class };
  export let disabled = false;
  export let type: "button" | "submit" | "reset" = "button";

  $: classes = cn(buttonVariants({ variant, size }), className);
</script>

<button
  {type}
  class={classes}
  {disabled}
  on:click
>
  <slot />
</button>
