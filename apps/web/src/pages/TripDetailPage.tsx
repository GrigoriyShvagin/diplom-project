import { Link, useParams } from "react-router-dom";

export function TripDetailPage() {
  const { id } = useParams();
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
      <h1 style={{ fontSize: 56 }}>Trip {id ?? ""}</h1>
      <p style={{ color: "var(--ink-3)" }}>Coming soon.</p>
      <Link to="/" className="btn btn-ghost btn-sm">
        ← Назад
      </Link>
    </main>
  );
}
