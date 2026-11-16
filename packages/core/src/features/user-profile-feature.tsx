import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import {
  useUserStore,
  useCounterStore,
  useLocaleStore,
  incrementCounter,
  decrementCounter,
} from "../react";

export interface UserProfileFeatureProps {
  /** Label of the app rendering the feature, shown as a badge. */
  framework?: string;
  /** Where the component comes from, shown under the title. */
  source?: string;
}

/**
 * Shared User Profile Feature component
 * Demonstrates cross-framework state sync with counter and locale
 * Usage: Import from @repo/core in any React-based MFE
 */
export function UserProfileFeature({
  framework = "React",
  source = "@repo/core",
}: UserProfileFeatureProps = {}) {
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
              <CardDescription>
                {locale === "en"
                  ? `Shared Component from ${source}`
                  : `Component chia sẻ từ ${source}`}
              </CardDescription>
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
                <Badge variant="success">{locale.toUpperCase()}</Badge>
                <Badge variant="outline">{framework}</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30 border border-border/50">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{user?.name || "Guest"}</h3>
              <p className="text-sm text-muted-foreground">
                {user?.email || "No email"}
              </p>
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
