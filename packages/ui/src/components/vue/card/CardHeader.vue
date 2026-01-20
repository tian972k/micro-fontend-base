<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@repo/utils";
import { cardClasses } from "../../../shared/variants/card";

interface CardHeaderProps {
  class?: string;
}

const props = defineProps<CardHeaderProps>();

const classes = computed(() => cn(cardClasses.header, props.class));
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
