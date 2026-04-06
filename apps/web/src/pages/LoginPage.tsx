import { Link } from "react-router-dom";

export function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 32,
      }}
    >
      <h1 style={{ fontSize: 56 }}>Login</h1>
      <p style={{ color: "var(--ink-3)" }}>Coming soon.</p>
      <Link to="/" className="btn btn-ghost btn-sm">
        ← Назад
      </Link>
    </main>
  );
}
