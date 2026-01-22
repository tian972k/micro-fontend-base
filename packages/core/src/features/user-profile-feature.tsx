import { Button, Card, CardHeader, CardTitle, CardContent } from "@repo/ui";
import {
  useUserStore,
  useCounterStore,
  useLocaleStore,
  incrementCounter,
  decrementCounter,
} from "../react";

/**
 * Shared User Profile Feature component
 * Demonstrates cross-framework state sync with counter and locale
 * Usage: Import from @repo/core in any React-based MFE
 */
export function UserProfileFeature() {
  const count = useCounterStore((state) => state.count);
  const user = useUserStore((state) => state.user);
  const { locale, setLocale } = useLocaleStore();

  const toggleLocale = () => {
    setLocale(locale === "en" ? "vi" : "en");
  };

  return (
    <div className="p-4 bg-background">
      <Card className="border-primary/20 shadow-sm overflow-hidden">
        <CardHeader className="bg-primary/[0.03] space-y-1">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">
                {locale === "en" ? "User Profile" : "Hồ sơ Người dùng"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {locale === "en"
                  ? "Shared Component from @repo/core"
                  : "Component chia sẻ từ @repo/core"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={toggleLocale}>
              {locale === "en" ? "🇻🇳 Tiếng Việt" : "🇺🇸 English"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
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
                <span className="px-2 py-1 text-xs font-medium rounded bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300">
                  React
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {user?.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-accent/20 border border-accent/30 text-center space-y-3">
            <p className="text-sm font-medium text-accent-foreground">
              {locale === "en" ? "Shared State Sync" : "Đồng bộ Trạng thái"}
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
        </CardContent>
      </Card>
    </div>
  );
}
