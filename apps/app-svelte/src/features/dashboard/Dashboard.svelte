<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { counterStore, incrementCounter, decrementCounter, userStore } from "@repo/core/svelte";

  let count = counterStore.getState().count;
  let user = userStore.getState().user;

  let unsubCounter: (() => void) | undefined;
  let unsubUser: (() => void) | undefined;

  onMount(() => {
    unsubCounter = counterStore.subscribe((state) => {
      count = state.count;
    });
    unsubUser = userStore.subscribe((state) => {
      user = state.user;
    });
  });

  onDestroy(() => {
    unsubCounter?.();
    unsubUser?.();
  });
</script>

<div class="p-4 bg-background">
  <div class="border border-primary/20 shadow-sm overflow-hidden rounded-lg bg-card">
    <div class="bg-primary/[0.03] p-4 space-y-1">
      <h2 class="text-xl font-semibold">User Profile</h2>
      <p class="text-sm text-muted-foreground">
        Shared Component from Svelte
      </p>
    </div>
    <div class="p-6 space-y-4">
      <div class="flex items-center space-x-4 p-3 rounded-lg bg-muted/30 border border-border/50">
        <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
          {user?.name?.charAt(0) || "U"}
        </div>
        <div>
          <h3 class="font-semibold text-lg">{user?.name || "Guest"}</h3>
          <p class="text-sm text-muted-foreground">{user?.email || "No email"}</p>
        </div>
      </div>

      <div class="p-4 rounded-lg bg-accent/20 border border-accent/30 text-center space-y-3">
        <p class="text-sm font-medium text-accent-foreground">
          Shared State Sync
        </p>
        <div class="text-4xl font-bold tracking-tighter text-primary">
          {count}
        </div>
        <div class="flex justify-center gap-2">
          <button
            class="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            on:click={() => decrementCounter()}
          >
            -
          </button>
          <button
            class="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            on:click={() => incrementCounter()}
          >
            +
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
