import { Button } from "@repo/ui";
import {
  useCounterStore,
  useUserStore,
  useLocaleStore,
  incrementCounter,
  decrementCounter,
} from "@repo/core/react";

/**
 * Next.js User Profile Feature Component
 * Demonstrates cross-framework state sync with counter
 */
export function UserProfileFeature() {
  // Use the shared counter store with proper React hook
  const count = useCounterStore((state) => state.count);
  const user = useUserStore((state) => state.user);
  const { locale, setLocale } = useLocaleStore();

  const toggleLocale = () => {
    setLocale(locale === "en" ? "vi" : "en");
  };

  return (
    <div className="p-4 bg-background">
      <div className="border border-primary/20 shadow-sm overflow-hidden rounded-lg bg-card">
        <div className="bg-primary/[0.03] p-4 space-y-1">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">User Profile</h2>
              <p className="text-sm text-muted-foreground">
                Shared Component from Next.js
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={toggleLocale}>
              {locale === "en" ? "🇻🇳 Tiếng Việt" : "🇺🇸 English"}
            </Button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {/* Locale Sync Indicator */}
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  {locale === "en" ? "Locale Synced" : "Đồng bộ Ngôn ngữ"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  {locale.toUpperCase()}
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  Next.js
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{user?.name || "Guest"}</h3>
              <p className="text-sm text-muted-foreground">
                {user?.email || "No email"}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-accent/20 border border-accent/30 text-center space-y-3">
            <p className="text-sm font-medium text-accent-foreground">
              Shared State Sync
            </p>
            <div className="text-4xl font-bold tracking-tighter text-primary">
              {count}
            </div>
            <div className="flex justify-center gap-2">
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
        </div>
      </div>
    </div>
  );
}
