import { User } from "../types";
import { apiRequest } from "./client";

export interface AuthResponse {
  user: User;
  token: string;
}

export function registerRequest(input: { email: string; password: string; name: string }) {
  return apiRequest<AuthResponse>("/auth/register", { method: "POST", body: input, skipAuth: true });
}

export function loginRequest(input: { email: string; password: string }) {
  return apiRequest<AuthResponse>("/auth/login", { method: "POST", body: input, skipAuth: true });
}

export function meRequest(signal?: AbortSignal) {
  return apiRequest<{ user: User }>("/auth/me", { signal });
}
