<script lang="ts">
  import { cn } from "@repo/utils";
  import { cardClasses } from "../../../shared/variants/card";

  export let gradient = false;
  let className = "";
  export { className as class };

  $: classes = cn(cardClasses.root, gradient && cardClasses.rootGradient, className);
</script>

<div class={classes}>
  <slot />
</div>
