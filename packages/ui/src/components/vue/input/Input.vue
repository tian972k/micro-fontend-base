<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@repo/utils";
import { inputClasses } from "../../../shared/variants/input";

interface InputProps {
  modelValue?: string | number;
  class?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<InputProps>(), {
  type: "text",
  disabled: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const classes = computed(() => cn(inputClasses.base, props.class));

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
}
</script>

<template>
  <input
    :type="type"
    :class="classes"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    @input="handleInput"
  />
</template>
