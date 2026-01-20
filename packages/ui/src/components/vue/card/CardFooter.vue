<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@repo/utils";
import { cardClasses } from "../../../shared/variants/card";

interface CardFooterProps {
  class?: string;
}

const props = defineProps<CardFooterProps>();

const classes = computed(() => cn(cardClasses.footer, props.class));
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
