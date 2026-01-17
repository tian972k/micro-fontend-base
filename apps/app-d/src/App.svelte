<script lang="ts">
  import Dashboard from "./features/dashboard/Dashboard.svelte";
  import type { User } from "@repo/core";

  export let theme: "light" | "dark" | "system" | undefined = undefined;
  export let locale: string | undefined = undefined;
  export let auth: { user: User | null; token: string } | undefined = undefined;
  export let eventBus: unknown | undefined = undefined;
</script>

<Dashboard />
