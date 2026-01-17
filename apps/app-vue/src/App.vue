<script setup lang="ts">
import Dashboard from "./features/dashboard/Dashboard.vue";
import type { MicroAppProps } from "@repo/core";

defineProps<MicroAppProps>();
</script>

<template>
  <Dashboard />
</template>
