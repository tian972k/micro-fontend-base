import { UserProfileFeature } from "./features/user-profile";

import { type MicroAppProps, useLocaleStore } from "@repo/core/react";
import { useTranslation } from "react-i18next";
import { Card, Button } from "@repo/ui/react";
import { useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function App(_props: MicroAppProps) {
  const { t, i18n } = useTranslation(["dashboard", "common"]);
  const { locale, setLocale } = useLocaleStore();

  // Sync i18next with locale store
  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  const toggleLanguage = () => {
    setLocale(locale === "en" ? "vi" : "en");
  };

  return (
    <div className="p-4 space-y-4">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{t("dashboard:title")}</h1>
          <Button onClick={toggleLanguage} variant="outline">
            {locale === "en" ? "🇻🇳 Tiếng Việt" : "🇺🇸 English"}
          </Button>
        </div>
        <p className="text-gray-600 mb-4">{t("dashboard:welcome_message")}</p>
        <div className="p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            {t("dashboard:only_in_react")}
          </p>
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-500">
            Shared Translation: {t("common:welcome")} | {t("common:language")}
          </p>
        </div>
      </Card>

      <UserProfileFeature />
    </div>
  );
}

export default App;
