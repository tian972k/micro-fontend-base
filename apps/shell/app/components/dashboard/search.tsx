import { useId, useState, type FormEvent } from "react";
import { useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Input } from "@repo/ui";
import { NAV_ITEMS } from "@/components/layout/sidebar/nav-config";

/** Best match first: title prefix, then title or URL containing the query. */
export function findNavMatch(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return (
    NAV_ITEMS.find((item) => item.title.toLowerCase().startsWith(q)) ??
    NAV_ITEMS.find(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q),
    )
  );
}

/**
 * Jump to any app or page: type part of its name and press Enter. The
 * suggestion list is the same registry-driven list the sidebar shows.
 */
export function Search() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [notFound, setNotFound] = useState(false);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const match = findNavMatch(query);
    setNotFound(!match);
    if (match) {
      setQuery("");
      navigate(match.url);
    }
  };

  return (
    <form role="search" onSubmit={onSubmit}>
      <Input
        type="search"
        list={listId}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setNotFound(false);
        }}
        placeholder={t("search.placeholder")}
        aria-label={t("search.label")}
        aria-invalid={notFound || undefined}
        title={notFound ? t("search.no_results") : undefined}
        className="md:w-[100px] lg:w-[300px]"
      />
      <datalist id={listId}>
        {NAV_ITEMS.map((item) => (
          <option key={item.url} value={item.title} />
        ))}
      </datalist>
    </form>
  );
}
