<script lang="ts">
  import Dashboard from "./features/dashboard/Dashboard.svelte";
  import type { User } from "@repo/core";

  // svelte-ignore unused-export-let
  export let theme: "light" | "dark" | "system" | undefined = undefined;
  // svelte-ignore unused-export-let
  export let locale: string | undefined = undefined;
  // svelte-ignore unused-export-let
  export let auth: { user: User | null; token: string } | undefined = undefined;
  // svelte-ignore unused-export-let
  export let eventBus: unknown | undefined = undefined;
</script>

<Dashboard />
