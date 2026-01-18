<script setup lang="ts">
import { state } from "@/main";

const increment = () => {
  state.count++;
};
</script>

<template>
  <div
    class="p-6 border rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100 border-emerald-200 dark:border-emerald-800"
  >
    <h2 class="text-2xl font-bold mb-4">Micro App C (Vue 3)</h2>
    <p class="mb-4 opacity-80">
      This is a full Vue application running as a micro-frontend!
    </p>

    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-4">
        <button
          @click="increment"
          class="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
        >
          Vue Count: {{ state.count }}
        </button>
      </div>

      <div
        class="p-4 bg-white/50 dark:bg-black/20 rounded-md border border-emerald-100 dark:border-emerald-900 text-sm"
      >
        <strong>SyncStore Status:</strong>
        <br />
        This value is reactive and synced across React/Redux/Svelte apps.
      </div>
    </div>
  </div>
</template>
