import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import {
  useLocaleStore,
  useThemeStore,
  type Locale,
  type Theme,
} from "@repo/core/react";
import { mergeMeta } from "@/lib/meta";

export const meta = mergeMeta(() => [{ title: "Settings - Orbit Platform" }]);

const THEMES: { value: Theme; icon: typeof Sun }[] = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
];

const LOCALES: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "vi", label: "Tiếng Việt" },
];

export default function SettingsRoute() {
  const { t } = useTranslation();
  const { theme, setTheme } = useThemeStore();
  const { locale, setLocale } = useLocaleStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("settings.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("settings.description")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.appearance")}</CardTitle>
          <CardDescription>
            {t("settings.appearance_description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            role="radiogroup"
            aria-label={t("settings.appearance")}
            className="flex flex-wrap gap-2"
          >
            {THEMES.map(({ value, icon: Icon }) => (
              <Button
                key={value}
                role="radio"
                aria-checked={theme === value}
                variant={theme === value ? "default" : "outline"}
                onClick={() => setTheme(value)}
              >
                <Icon className="mr-2 h-4 w-4" aria-hidden />
                {t(`theme.${value}`)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.language")}</CardTitle>
          <CardDescription>
            {t("settings.language_description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            role="radiogroup"
            aria-label={t("settings.language")}
            className="flex flex-wrap gap-2"
          >
            {LOCALES.map(({ value, label }) => (
              <Button
                key={value}
                role="radio"
                aria-checked={locale === value}
                variant={locale === value ? "default" : "outline"}
                onClick={() => setLocale(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
