<script lang="ts">
  import { cn } from "@repo/utils";
  import { badgeVariants, type BadgeVariant } from "../../../shared/variants/badge";

  export let variant: BadgeVariant = "default";
  let className = "";
  export { className as class };

  $: classes = cn(badgeVariants({ variant }), className);
</script>

<span class={classes}>
  <slot />
</span>
