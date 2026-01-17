import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import i18next from "./i18next.client";

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <I18nextProvider i18n={i18next}>
        <RemixBrowser />
      </I18nextProvider>
    </StrictMode>,
  );
});
