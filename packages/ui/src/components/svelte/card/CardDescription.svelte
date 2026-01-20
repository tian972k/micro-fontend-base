<script lang="ts">
  import { cn } from "@repo/utils";
  import { cardClasses } from "../../../shared/variants/card";

  let className = "";
  export { className as class };

  $: classes = cn(cardClasses.description, className);
</script>

<p class={classes}>
  <slot />
</p>
