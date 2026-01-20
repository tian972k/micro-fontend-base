<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@repo/utils";
import { buttonVariants, type ButtonVariant, type ButtonSize } from "../../../shared/variants/button";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  class?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  asChild?: boolean;
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: "default",
  size: "default",
  type: "button",
  disabled: false,
  asChild: false,
});

const classes = computed(() =>
  cn(buttonVariants({ variant: props.variant, size: props.size }), props.class)
);
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>
