import { apiRequest } from "./api-client";
import type { SessionResponse } from "@/types/api";

export function loginRequest(email: string, password: string) {
  return apiRequest<SessionResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logoutRequest() {
  return apiRequest<void>("/api/v1/auth/logout", { method: "POST" });
}

export function fetchSession() {
  return apiRequest<SessionResponse>("/api/v1/auth/me");
}
