<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@repo/utils";
import { cardClasses } from "../../../shared/variants/card";

interface CardDescriptionProps {
  class?: string;
}

const props = defineProps<CardDescriptionProps>();

const classes = computed(() => cn(cardClasses.description, props.class));
</script>

<template>
  <p :class="classes">
    <slot />
  </p>
</template>
