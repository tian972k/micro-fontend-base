import { createSignal, onMount, onCleanup } from "solid-js";
import {
  counterStore,
  incrementCounter,
  decrementCounter,
  userStore,
  localeStore,
  type Locale,
} from "@repo/core/solid";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/solid";

/**
 * SolidJS User Profile Feature Component
 * Demonstrates cross-framework state sync with counter
 */
export function UserProfileFeature() {
  const [count, setCount] = createSignal(counterStore.getState().count);
  const [user, setUser] = createSignal(userStore.getState().user);
  const [locale, setLocale] = createSignal<Locale>(
    localeStore.getState().locale,
  );

  const toggleLocale = () => {
    const newLocale: Locale = locale() === "en" ? "vi" : "en";
    localeStore.getState().setLocale(newLocale);
  };

  onMount(() => {
    // Subscribe to counter store changes
    const unsubCounter = counterStore.subscribe((state) => {
      setCount(state.count);
    });

    // Subscribe to user store changes
    const unsubUser = userStore.subscribe((state) => {
      setUser(state.user);
    });

    // Subscribe to locale store changes
    const unsubLocale = localeStore.subscribe((state) => {
      setLocale(state.locale);
    });

    onCleanup(() => {
      unsubCounter();
      unsubUser();
      unsubLocale();
    });
  });

  return (
    <div class="p-4 bg-background">
      <Card class="border-primary/20 overflow-hidden">
        <CardHeader class="bg-primary/[0.03]">
          <div class="flex justify-between items-center">
            <div>
              <CardTitle class="text-xl">User Profile</CardTitle>
              <CardDescription>Shared Component from SolidJS</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={toggleLocale}>
              {locale() === "en" ? "🇻🇳 Tiếng Việt" : "🇺🇸 English"}
            </Button>
          </div>
        </CardHeader>
        <CardContent class="pt-6 space-y-4">
          {/* Locale Sync Indicator */}
          <div class="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span class="text-sm font-medium text-green-700 dark:text-green-300">
                {locale() === "en" ? "Locale Synced" : "Đồng bộ Ngôn ngữ"}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <Badge variant="success">{locale().toUpperCase()}</Badge>
              <Badge variant="outline">SolidJS</Badge>
            </div>
          </div>

          <div class="flex items-center space-x-4 p-3 rounded-lg bg-muted/30 border border-border/50">
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {user()?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h3 class="font-semibold text-lg">{user()?.name || "Guest"}</h3>
              <p class="text-sm text-muted-foreground">
                {user()?.email || "No email"}
              </p>
            </div>
          </div>

          <div class="p-4 rounded-lg bg-accent/20 border border-accent/30 text-center space-y-3">
            <p class="text-sm font-medium text-accent-foreground">
              Shared State Sync
            </p>
            <div class="text-4xl font-bold tracking-tighter text-primary">
              {count()}
            </div>
            <div class="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => decrementCounter()}
              >
                -
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => incrementCounter()}
              >
                +
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
