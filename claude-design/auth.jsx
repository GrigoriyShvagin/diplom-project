/* global React, useT, Logo, LangSwitcher, Placeholder */
const { useState } = React;

function AuthShell({ mode, onNav }) {
  const { t, lang } = useT();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (f) => {
    const e = {};
    if (mode === "register" && !f.name.trim()) e.name = t("auth.err.name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = t("auth.err.email");
    if (f.password.length < 8) e.password = t("auth.err.pwd");
    return e;
  };

  const set = (k, v) => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (touched[k]) setErrors(validate(next));
  };
  const blur = (k) => { setTouched({ ...touched, [k]: true }); setErrors(validate(form)); };
  const submit = (e) => {
    e.preventDefault();
    const all = { name: true, email: true, password: true };
    setTouched(all);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onNav("dashboard");
  };

  const isLogin = mode === "login";

  return (
    <div className="fade-in" style={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
      background: "var(--paper)",
    }}>
      {/* Form side */}
      <div style={{
        padding: "32px 48px",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 64 }}>
          <button onClick={() => onNav("landing")} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <Logo />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <LangSwitcher />
            <span style={{ color: "var(--ink-3)", fontSize: 13 }}>
              {isLogin ? t("auth.login.alt") : t("auth.signup.alt")}{" "}
              <button onClick={() => onNav(isLogin ? "register" : "login")}
                style={{ color: "var(--terracotta)", textDecoration: "underline", textUnderlineOffset: 3 }}>
                {isLogin ? t("auth.login.altLink") : t("auth.signup.altLink")}
              </button>
            </span>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form onSubmit={submit} style={{ width: "100%", maxWidth: 420 }}>
            <h1 style={{ fontSize: 40, marginBottom: 10, lineHeight: 1.1, fontWeight: 600 }}>
              {isLogin ? <>С <span className="display-italic">возвращением</span></> : <>Создайте <span className="display-italic">аккаунт</span></>}
            </h1>
            <p style={{ color: "var(--ink-3)", marginBottom: 28, fontSize: 14 }}>
              {isLogin ? t("auth.login.sub") : t("auth.signup.sub")}
            </p>

            {!isLogin && (
              <div style={{ marginBottom: 18 }}>
                <label className="label">{t("common.name")}</label>
                <input className="input" value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  onBlur={() => blur("name")}
                  placeholder="Анна Карелина"
                  style={errors.name ? { borderColor: "var(--terracotta)" } : null}
                />
                {errors.name && <div className="field-error">{errors.name}</div>}
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <label className="label">{t("common.email")}</label>
              <input className="input" type="email" value={form.email}
                onChange={(e) => set("email", e.target.value)}
                onBlur={() => blur("email")}
                placeholder="anna@journey.io"
                style={errors.email ? { borderColor: "var(--terracotta)" } : null}
              />
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            <div style={{ marginBottom: 28 }}>
              <label className="label" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{t("common.password")}</span>
                {isLogin && <a style={{ color: "var(--ink-3)", fontSize: 12, textDecoration: "underline", textUnderlineOffset: 3 }}>забыли?</a>}
              </label>
              <input className="input" type="password" value={form.password}
                onChange={(e) => set("password", e.target.value)}
                onBlur={() => blur("password")}
                placeholder="не меньше 8 символов"
                style={errors.password ? { borderColor: "var(--terracotta)" } : null}
              />
              {errors.password && <div className="field-error">{errors.password}</div>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
              {isLogin ? t("auth.login.cta") : t("auth.signup.cta")} →
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "28px 0", color: "var(--ink-3)", fontSize: 12 }}>
              <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
              <span className="mono" style={{ letterSpacing: "0.1em" }}>или</span>
              <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button type="button" className="btn btn-ghost">Google</button>
              <button type="button" className="btn btn-ghost">Telegram</button>
            </div>
          </form>
        </div>

        <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em" }}>
          © 2026 friends journey · {lang.toUpperCase()}
        </div>
      </div>

      {/* Hero side */}
      <aside className="hide-on-mobile" style={{
        position: "relative",
        background: "linear-gradient(135deg, oklch(0.50 0.07 200), oklch(0.35 0.06 220))",
        overflow: "hidden",
        padding: 48,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        color: "var(--paper)",
      }}>
        <svg viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.85 }}>
          <defs>
            <pattern id="auth-stripes" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="14" height="14" fill="var(--terracotta)" />
              <rect width="1" height="14" fill="oklch(0.42 0.12 38)" />
            </pattern>
          </defs>
          <circle cx="450" cy="200" r="100" fill="oklch(0.86 0.10 75)" opacity="0.6" />
          <path d="M 0 600 L 100 480 L 220 540 L 380 440 L 540 530 L 600 500 L 600 800 L 0 800 Z" fill="url(#auth-stripes)" opacity="0.85" />
          <path d="M 0 700 L 140 620 L 320 660 L 480 600 L 600 640 L 600 800 L 0 800 Z" fill="oklch(0.20 0.04 220)" opacity="0.7" />
          <path d="M 60 720 Q 200 680 360 700 T 580 690"
            stroke="var(--paper)" strokeWidth="2" fill="none" strokeDasharray="3 5" />
          {[[100, 715], [260, 695], [440, 698], [560, 690]].map(([x,y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="6" fill="var(--paper)" />
              <circle cx={x} cy={y} r="3" fill="var(--terracotta)" />
            </g>
          ))}
        </svg>

        <div style={{ position: "relative", zIndex: 2 }} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <p style={{
            fontFamily: "var(--font-display)",
            fontSize: 36, lineHeight: 1.2, fontStyle: "italic",
            margin: 0, marginBottom: 12, maxWidth: 440,
          }}>{t("auth.aside.q")}</p>
          <p style={{ fontSize: 12, opacity: 0.7 }}>— {t("auth.aside.author")}</p>
        </div>
      </aside>
    </div>
  );
}

window.AuthShell = AuthShell;
