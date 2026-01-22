<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { counterStore, incrementCounter, decrementCounter, userStore, localeStore, type Locale } from "@repo/core/svelte";

  let count = counterStore.getState().count;
  let user = userStore.getState().user;
  let locale: Locale = localeStore.getState().locale;

  const toggleLocale = () => {
    const newLocale: Locale = locale === "en" ? "vi" : "en";
    localeStore.getState().setLocale(newLocale);
  };

  let unsubCounter: (() => void) | undefined;
  let unsubUser: (() => void) | undefined;
  let unsubLocale: (() => void) | undefined;

  onMount(() => {
    unsubCounter = counterStore.subscribe((state) => {
      count = state.count;
    });
    unsubUser = userStore.subscribe((state) => {
      user = state.user;
    });
    unsubLocale = localeStore.subscribe((state) => {
      locale = state.locale;
    });
  });

  onDestroy(() => {
    unsubCounter?.();
    unsubUser?.();
    unsubLocale?.();
  });
</script>

<div class="p-4 bg-background">
  <div class="border border-primary/20 shadow-sm overflow-hidden rounded-lg bg-card">
    <div class="bg-primary/[0.03] p-4 space-y-1">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-semibold">User Profile</h2>
          <p class="text-sm text-muted-foreground">
            Shared Component from Svelte
          </p>
        </div>
        <button
          class="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          on:click={toggleLocale}
        >
          {locale === 'en' ? '🇻🇳 Tiếng Việt' : '🇺🇸 English'}
        </button>
      </div>
    </div>
    <div class="p-6 space-y-4">
      <!-- Locale Sync Indicator -->
      <div class="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span class="text-sm font-medium text-green-700 dark:text-green-300">
              {locale === 'en' ? 'Locale Synced' : 'Đồng bộ Ngôn ngữ'}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              {locale.toUpperCase()}
            </span>
            <span class="px-2 py-1 text-xs font-medium rounded bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300">
              Svelte
            </span>
          </div>
        </div>
      </div>

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
