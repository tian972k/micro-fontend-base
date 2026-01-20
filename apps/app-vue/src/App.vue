<script setup lang="ts">
import Dashboard from "./features/dashboard/Dashboard.vue";
import type { MicroAppProps } from "@repo/core/vue";

defineProps<MicroAppProps>();
</script>

<template>
  <Dashboard />
</template>
