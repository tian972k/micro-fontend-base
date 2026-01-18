<script lang="ts">
  import { count } from "../../main";

  function increment() {
    $count++;
  }
</script>

<div
  class="p-6 border rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-900 dark:text-orange-100 border-orange-200 dark:border-orange-800"
>
  <h2 class="text-2xl font-bold mb-4">Micro App D (Svelte 4)</h2>
  <p class="mb-4 opacity-80">
    This is a full Svelte application running as a micro-frontend!
  </p>

  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-4">
      <button
        on:click={increment}
        class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
      >
        Svelte Count: {$count}
      </button>
    </div>

    <div class="p-4 bg-white/50 dark:bg-black/20 rounded-md border border-orange-100 dark:border-orange-900 text-sm">
      <strong>SyncStore Status:</strong>
      <br />
      This component uses Svelte stores synced via the global EventBus.
    </div>
  </div>
</div>
