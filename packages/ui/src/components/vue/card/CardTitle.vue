<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@repo/utils";
import { cardClasses } from "../../../shared/variants/card";

interface CardTitleProps {
  class?: string;
}

const props = defineProps<CardTitleProps>();

const classes = computed(() => cn(cardClasses.title, props.class));
</script>

<template>
  <h3 :class="classes">
    <slot />
  </h3>
</template>
