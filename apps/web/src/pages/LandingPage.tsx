import { useNavigate } from "react-router-dom";
import { useT } from "@/shared/lib/i18n";
import { Logo } from "@/shared/ui/Logo";
import { LangSwitcher } from "@/shared/ui/LangSwitcher";

export function LandingPage() {
  const { t } = useT();
  const navigate = useNavigate();

  return (
    <div className="fade-in" style={{ background: "var(--paper)" }}>
      {/* Top nav */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "oklch(from var(--paper) l c h / 0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Logo />
          <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <a
              className="hide-on-mobile"
              style={{ fontSize: 14, color: "var(--ink-2)" }}
              href="#features"
            >
              {t("land.feat.eyebrow")}
            </a>
            <a
              className="hide-on-mobile"
              style={{ fontSize: 14, color: "var(--ink-2)" }}
              href="#how"
            >
              {t("land.how.eyebrow")}
            </a>
            <LangSwitcher />
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/login")}>
              {t("nav.login")}
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/trips")}>
              {t("nav.create")}
            </button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "56px 32px 40px" }}>
        <h1
          style={{
            fontSize: "clamp(48px, 7.5vw, 108px)",
            lineHeight: 0.98,
            marginBottom: 28,
            fontWeight: 600,
          }}
        >
          {t("land.hero.a")}
          <br />
          <span className="display-italic" style={{ color: "var(--terracotta)" }}>
            {t("land.hero.b")}
          </span>
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
            gap: 48,
            alignItems: "end",
            marginBottom: 40,
          }}
        >
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.5,
              color: "var(--ink-2)",
              maxWidth: 520,
              margin: 0,
            }}
          >
            {t("land.hero.sub")}
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/trips")}>
              {t("land.cta.primary")} →
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate("/login")}>
              {t("land.cta.secondary")}
            </button>
          </div>
        </div>

        {/* Hero image */}
        <div
          style={{
            position: "relative",
            height: 560,
            borderRadius: "var(--r-xl)",
            overflow: "hidden",
            background:
              "linear-gradient(180deg, oklch(0.55 0.06 215), oklch(0.40 0.07 30) 60%, oklch(0.30 0.05 30))",
            border: "1px solid var(--line-2)",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2000&q=80&auto=format&fit=crop"
            alt=""
            loading="eager"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 65%",
              filter: "saturate(0.85) contrast(1.02)",
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, oklch(0.40 0.10 35 / 0.15) 0%, transparent 35%, oklch(0.25 0.05 30 / 0.35) 100%), radial-gradient(ellipse at 70% 30%, oklch(0.75 0.10 60 / 0.18), transparent 60%)",
              mixBlendMode: "multiply",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, transparent 50%, oklch(0.18 0.03 30 / 0.55) 100%)",
              pointerEvents: "none",
            }}
          />
          {/* Top-left location tag */}
          <div
            style={{
              position: "absolute",
              top: 28,
              left: 32,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 14px",
              background: "oklch(0.18 0.02 30 / 0.45)",
              backdropFilter: "blur(12px)",
              border: "1px solid oklch(1 0 0 / 0.18)",
              borderRadius: 999,
              color: "var(--paper)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "oklch(0.78 0.13 145)",
              }}
            />
            <span
              className="mono"
              style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              Грузия · Казбеги · 41.6° N, 44.6° E
            </span>
          </div>
          {/* Top-right route badge */}
          <div
            style={{
              position: "absolute",
              top: 28,
              right: 32,
              padding: "10px 14px",
              background: "oklch(0.98 0.012 80 / 0.92)",
              backdropFilter: "blur(8px)",
              borderRadius: "var(--r-md)",
              border: "1px solid oklch(1 0 0 / 0.4)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              minWidth: 140,
            }}
          >
            <span className="eyebrow">текущая поездка</span>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, lineHeight: 1.1 }}>
              <span className="display-italic" style={{ color: "var(--terracotta)" }}>
                Тбилиси
              </span>{" "}
              → Казбеги
            </div>
            <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>
              3 дня · 4 чел
            </span>
          </div>

          {/* Floating UI cards */}
          <div
            style={{
              position: "absolute",
              top: 32,
              left: 32,
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-md)",
              padding: 14,
              width: 220,
              boxShadow: "var(--shadow-md)",
              transform: "translateY(56px)",
            }}
          >
            <div className="eyebrow" style={{ marginBottom: 6 }}>
              день 3 · казбеги
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1.1 }}>
              Гергети,
              <br />
              Троицкая церковь
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                13:00 · 1.5 ч
              </span>
              <span style={{ display: "inline-flex" }}>
                {[
                  "oklch(0.62 0.135 40)",
                  "oklch(0.78 0.10 60)",
                  "oklch(0.72 0.10 200)",
                  "oklch(0.75 0.10 145)",
                ].map((c, i) => (
                  <span
                    key={c}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: c,
                      border: "2px solid var(--paper)",
                      marginLeft: i === 0 ? 0 : -6,
                    }}
                  />
                ))}
              </span>
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              top: 86,
              right: 32,
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-md)",
              padding: 14,
              width: 220,
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="eyebrow" style={{ marginBottom: 6 }}>
              голосование
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>Где ужинаем?</div>
            <div
              style={{
                height: 4,
                background: "var(--paper-3)",
                borderRadius: 2,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: "66%",
                  height: "100%",
                  background: "var(--terracotta)",
                  borderRadius: 2,
                }}
              />
            </div>
            <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
              2 / 3 · открыто
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 28,
              left: 32,
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-md)",
              padding: 14,
              width: 240,
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="eyebrow" style={{ marginBottom: 6 }}>
              бюджет
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 26 }}>38 540 ₽</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--moss)" }}>
                +9 635 / чел
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        style={{
          background: "var(--paper-2)",
          padding: "96px 0",
          borderTop: "1px solid var(--line)",
        }}
      >
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 32px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr)",
              gap: 48,
              marginBottom: 56,
            }}
          >
            <div>
              <span className="eyebrow">{t("land.feat.eyebrow")}</span>
            </div>
            <h2 style={{ fontSize: "clamp(34px, 5vw, 64px)", maxWidth: 720 }}>
              {t("land.feat.h").split("—")[0]}
              <span className="display-italic" style={{ color: "var(--terracotta)" }}>
                —{t("land.feat.h").split("—")[1]}
              </span>
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {(
              [
                { num: "01", title: t("land.feat.f1.t"), desc: t("land.feat.f1.d"), icon: "co" },
                { num: "02", title: t("land.feat.f2.t"), desc: t("land.feat.f2.d"), icon: "map" },
                { num: "03", title: t("land.feat.f3.t"), desc: t("land.feat.f3.d"), icon: "vote" },
                { num: "04", title: t("land.feat.f4.t"), desc: t("land.feat.f4.d"), icon: "bud" },
              ] as const
            ).map((f, i) => (
              <article
                key={f.num}
                className="card"
                style={{
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  minHeight: 280,
                  background: i === 0 ? "var(--ink)" : "var(--paper)",
                  color: i === 0 ? "var(--paper)" : "var(--ink)",
                  borderColor: i === 0 ? "var(--ink)" : "var(--line)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    className="mono"
                    style={{ fontSize: 11, letterSpacing: "0.1em", opacity: 0.6 }}
                  >
                    {f.num}
                  </span>
                  <FeatureGlyph kind={f.icon} dark={i === 0} />
                </div>
                <div style={{ marginTop: "auto" }}>
                  <h3 style={{ fontSize: 28, marginBottom: 10, color: "inherit" }}>{f.title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.55, opacity: 0.75, margin: 0 }}>
                    {f.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: "96px 0", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              marginBottom: 56,
              flexWrap: "wrap",
            }}
          >
            <span className="eyebrow">{t("land.how.eyebrow")}</span>
            <h2 style={{ fontSize: "clamp(34px, 5vw, 64px)", flex: 1 }}>
              <span className="display-italic">
                {t("land.how.h").split(" ").slice(0, 2).join(" ")}
              </span>{" "}
              {t("land.how.h").split(" ").slice(2).join(" ")}
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
              position: "relative",
            }}
          >
            {[
              { n: "1", title: t("land.how.s1.t"), desc: t("land.how.s1.d") },
              { n: "2", title: t("land.how.s2.t"), desc: t("land.how.s2.d") },
              { n: "3", title: t("land.how.s3.t"), desc: t("land.how.s3.d") },
            ].map((s, i) => (
              <div key={s.n} style={{ position: "relative" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background:
                      i === 0
                        ? "var(--terracotta)"
                        : i === 1
                          ? "var(--teal)"
                          : "var(--moss)",
                    color: "var(--paper)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-display)",
                    fontSize: 36,
                    fontStyle: "italic",
                    marginBottom: 24,
                    boxShadow: "var(--shadow-md)",
                  }}
                >
                  {s.n}
                </div>
                <h3 style={{ fontSize: 28, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: "var(--ink-2)", lineHeight: 1.55, margin: 0 }}>{s.desc}</p>
                {i < 2 && (
                  <div
                    className="hide-on-mobile"
                    style={{
                      position: "absolute",
                      top: 36,
                      right: -12,
                      width: 24,
                      height: 1,
                      background: "var(--line-2)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "var(--ink)", color: "var(--paper)", padding: "72px 0 32px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 32px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.5fr) repeat(3, minmax(0, 1fr))",
              gap: 32,
              marginBottom: 56,
            }}
          >
            <div>
              <div style={{ filter: "invert(1)" }}>
                <Logo />
              </div>
              <p
                style={{
                  marginTop: 16,
                  color: "oklch(0.75 0.012 65)",
                  fontSize: 14,
                  maxWidth: 320,
                }}
              >
                {t("land.foot.tag")}
              </p>
            </div>
            {[
              {
                h: t("land.foot.product"),
                l: ["Возможности", "Карта", "Бюджет", "Голосования"],
              },
              {
                h: t("land.foot.company"),
                l: ["О проекте", "Команда", "Блог", "Связаться"],
              },
              {
                h: t("land.foot.legal"),
                l: ["Условия", "Конфиденциальность", "Cookies"],
              },
            ].map((c) => (
              <div key={c.h}>
                <div
                  className="eyebrow"
                  style={{ color: "oklch(0.65 0.012 65)", marginBottom: 16 }}
                >
                  {c.h}
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {c.l.map((li) => (
                    <li key={li} style={{ fontSize: 14, color: "oklch(0.85 0.012 65)" }}>
                      {li}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div
            style={{
              paddingTop: 24,
              borderTop: "1px solid oklch(0.30 0.012 60)",
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: "oklch(0.65 0.012 65)",
              fontFamily: "var(--font-mono)",
            }}
          >
            <span>© 2026 Friends Journey</span>
            <span>сделано с любовью для тех, кто едет вместе</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

type GlyphKind = "co" | "map" | "vote" | "bud";

function FeatureGlyph({ kind, dark }: { kind: GlyphKind; dark: boolean }) {
  const stroke = dark ? "var(--paper)" : "var(--ink)";
  const accent = "var(--terracotta)";
  const size = 40;
  if (kind === "co")
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="14" cy="14" r="6" stroke={stroke} strokeWidth="1.5" />
        <circle cx="26" cy="22" r="6" stroke={accent} strokeWidth="1.5" />
        <circle cx="18" cy="30" r="6" stroke={stroke} strokeWidth="1.5" />
      </svg>
    );
  if (kind === "map")
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <path
          d="M5 10 L15 7 L25 11 L35 8 L35 32 L25 35 L15 31 L5 34 Z"
          stroke={stroke}
          strokeWidth="1.5"
        />
        <path
          d="M15 7 L15 31 M25 11 L25 35"
          stroke={stroke}
          strokeWidth="1.5"
          strokeDasharray="2 2"
        />
        <circle cx="20" cy="20" r="3" fill={accent} />
      </svg>
    );
  if (kind === "vote")
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <rect x="6" y="14" width="20" height="4" stroke={stroke} strokeWidth="1.5" />
        <rect x="6" y="22" width="28" height="4" fill={accent} />
        <rect x="6" y="30" width="14" height="4" stroke={stroke} strokeWidth="1.5" />
      </svg>
    );
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="14" stroke={stroke} strokeWidth="1.5" />
      <path d="M20 8 V 32" stroke={stroke} strokeWidth="1.5" />
      <path
        d="M14 14 H 24 A 4 4 0 0 1 24 22 H 14 A 4 4 0 0 0 14 30 H 26"
        stroke={accent}
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}
