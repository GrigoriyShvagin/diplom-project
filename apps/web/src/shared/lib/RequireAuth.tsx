import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./auth-context";

export function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();
  if (auth.status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ink-3)",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
        }}
      >
        loading…
      </div>
    );
  }
  if (auth.status === "anon") return <Navigate to="/login" replace />;
  return <>{children}</>;
}
