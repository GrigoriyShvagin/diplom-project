import { apiFetch } from "./client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export function register(input: { name: string; email: string; password: string }) {
  return apiFetch<{ user: AuthUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(input: { email: string; password: string }) {
  return apiFetch<{ user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logout() {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}

export function getMe() {
  return apiFetch<AuthUser>("/users/me");
}
