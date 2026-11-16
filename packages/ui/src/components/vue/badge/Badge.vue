<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@repo/utils";
import { badgeVariants, type BadgeVariant } from "../../../shared/variants/badge";

const props = withDefaults(
  defineProps<{ variant?: BadgeVariant; class?: string }>(),
  { variant: "default" },
);

const classes = computed(() =>
  cn(badgeVariants({ variant: props.variant }), props.class),
);
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>
