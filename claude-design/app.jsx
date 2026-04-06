/* global React, ReactDOM, I18nProvider, Landing, AuthShell, Dashboard, TripDetail */
const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "adventure",
  "typeset": "editorial",
  "density": "comfortable",
  "radius": "soft"
}/*EDITMODE-END*/;

function App() {
  const [route, setRoute] = useState("landing");
  const [tripId, setTripId] = useState(null);
  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
  const [tweaksOpen, setTweaksOpen] = useState(false);

  // Apply tweaks to root
  useEffect(() => {
    const r = document.documentElement;
    r.dataset.palette = tweaks.palette;
    r.dataset.typeset = tweaks.typeset;
    r.dataset.density = tweaks.density;
    r.dataset.radius = tweaks.radius;
  }, [tweaks]);

  // Tweaks host protocol
  useEffect(() => {
    const onMsg = (e) => {
      if (e.data?.type === "__activate_edit_mode") setTweaksOpen(true);
      if (e.data?.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const setTweak = (k, v) => {
    const next = { ...tweaks, [k]: v };
    setTweaks(next);
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { [k]: v } }, "*");
  };

  const onNav = (r) => { setRoute(r); window.scrollTo({ top: 0 }); };
  const onOpenTrip = (id) => { setTripId(id); setRoute("trip"); window.scrollTo({ top: 0 }); };

  return (
    <I18nProvider>
      {route === "landing"   && <Landing onNav={onNav} />}
      {route === "login"     && <AuthShell mode="login" onNav={onNav} />}
      {route === "register"  && <AuthShell mode="register" onNav={onNav} />}
      {route === "dashboard" && <Dashboard onNav={onNav} onOpenTrip={onOpenTrip} />}
      {route === "trip"      && <TripDetail onNav={onNav} />}

      {/* Floating route hopper — for quick demo navigation */}
      <RouteHopper route={route} onNav={onNav} onOpenTrip={onOpenTrip} />

      {tweaksOpen && (
        <TweaksPanel onClose={() => setTweaksOpen(false)} title="Tweaks">
          <TweakRadio label="Палитра" options={[
            { value: "adventure", label: "Adventure" },
            { value: "sunset", label: "Sunset" },
            { value: "alpine", label: "Alpine" },
          ]} value={tweaks.palette} onChange={(v) => setTweak("palette", v)} />
          <TweakRadio label="Шрифт" options={[
            { value: "editorial", label: "Editorial" },
            { value: "modern", label: "Modern" },
            { value: "rounded", label: "Rounded" },
          ]} value={tweaks.typeset} onChange={(v) => setTweak("typeset", v)} />
          <TweakRadio label="Плотность" options={[
            { value: "cozy", label: "Cozy" },
            { value: "comfortable", label: "Default" },
            { value: "spacious", label: "Spacious" },
          ]} value={tweaks.density} onChange={(v) => setTweak("density", v)} />
          <TweakRadio label="Скругление" options={[
            { value: "sharp", label: "Sharp" },
            { value: "soft", label: "Soft" },
            { value: "round", label: "Round" },
          ]} value={tweaks.radius} onChange={(v) => setTweak("radius", v)} />
          <div style={{ paddingTop: 14, borderTop: "1px solid var(--line)", marginTop: 8 }}>
            <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", marginBottom: 8 }}>СТРАНИЦА</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[
                { id: "landing", label: "Landing" },
                { id: "login", label: "Login" },
                { id: "register", label: "Register" },
                { id: "dashboard", label: "Dashboard" },
                { id: "trip", label: "Trip" },
              ].map(r => (
                <button key={r.id} onClick={() => r.id === "trip" ? onOpenTrip("t1") : onNav(r.id)}
                  style={{
                    padding: "6px 8px",
                    borderRadius: "var(--r-sm)",
                    background: route === r.id ? "var(--ink)" : "var(--paper-2)",
                    color: route === r.id ? "var(--paper)" : "var(--ink-2)",
                    fontSize: 11, fontFamily: "var(--font-mono)",
                  }}>{r.label}</button>
              ))}
            </div>
          </div>
        </TweaksPanel>
      )}
    </I18nProvider>
  );
}

/* Quick route hopper — visible always so designer can flip between screens */
function RouteHopper({ route, onNav, onOpenTrip }) {
  const items = [
    { id: "landing", label: "01 · Landing" },
    { id: "login", label: "02 · Login" },
    { id: "register", label: "03 · Register" },
    { id: "dashboard", label: "04 · Dashboard" },
    { id: "trip", label: "05 · Trip" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 16, left: "50%",
      transform: "translateX(-50%)",
      background: "oklch(0.20 0.012 55 / 0.94)",
      backdropFilter: "blur(12px)",
      borderRadius: 999,
      padding: 4,
      display: "flex", gap: 2,
      boxShadow: "var(--shadow-lg)",
      zIndex: 90,
      border: "1px solid oklch(0.30 0.012 55)",
      fontFamily: "var(--font-mono)",
    }}>
      {items.map(it => (
        <button key={it.id}
          onClick={() => it.id === "trip" ? onOpenTrip("t1") : onNav(it.id)}
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            fontSize: 11,
            color: route === it.id ? "oklch(0.20 0.012 55)" : "oklch(0.85 0.012 65)",
            background: route === it.id ? "var(--paper)" : "transparent",
            letterSpacing: "0.06em",
            transition: "background 0.15s",
          }}>{it.label}</button>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
