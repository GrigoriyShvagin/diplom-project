import { useT, type Lang } from "@/shared/lib/i18n";

export function LangSwitcher() {
  const { lang, setLang } = useT();
  const langs: Lang[] = ["ru", "en"];
  return (
    <div
      style={{
        display: "inline-flex",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-pill)",
        padding: 3,
        background: "var(--paper)",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.06em",
      }}
    >
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            padding: "5px 11px",
            borderRadius: "var(--r-pill)",
            background: lang === l ? "var(--ink)" : "transparent",
            color: lang === l ? "var(--paper)" : "var(--ink-2)",
            transition: "background 0.15s ease",
            textTransform: "uppercase",
          }}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
