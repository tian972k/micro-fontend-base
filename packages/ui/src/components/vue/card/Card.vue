<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@repo/utils";
import { cardClasses } from "../../../shared/variants/card";

interface CardProps {
  class?: string;
  gradient?: boolean;
}

const props = withDefaults(defineProps<CardProps>(), {
  gradient: false,
});

const classes = computed(() =>
  cn(cardClasses.root, props.gradient && cardClasses.rootGradient, props.class)
);
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
