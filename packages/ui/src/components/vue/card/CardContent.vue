<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@repo/utils";
import { cardClasses } from "../../../shared/variants/card";

interface CardContentProps {
  class?: string;
}

const props = defineProps<CardContentProps>();

const classes = computed(() => cn(cardClasses.content, props.class));
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
