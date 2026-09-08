import { admLog } from "@/lib/adm-log";

function getApiBaseUrl() {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080"
  );
}

export async function nestLogin(
  email: string,
  password: string,
): Promise<{ is_admin: boolean; token: string }> {
  const response = await fetch(`${getApiBaseUrl()}/users/login`, {
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    admLog.warn("nestFetch error", {
      method: "POST",
      path: "/users/login",
      status: response.status,
    });
    throw new Error("Falha ao autenticar na API");
  }

  return response.json() as Promise<{ is_admin: boolean; token: string }>;
}

export async function nestFetch(
  path: string,
  apiToken: string,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${apiToken}`);

  const method = (init?.method ?? "GET").toUpperCase();
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    admLog.warn("nestFetch error", {
      method,
      path,
      status: response.status,
    });
  }

  return response;
}

export type PlacePrediction = {
  description: string;
  mainText: string;
  placeId: string;
  reference: string;
  secondaryText: string;
  types: string[];
};

export async function nestAutocompletePlaces(
  input: string,
  apiToken: string,
): Promise<PlacePrediction[]> {
  if (!input.trim()) {
    return [];
  }

  const response = await nestFetch(
    `/places/autocomplete?input=${encodeURIComponent(input.trim())}`,
    apiToken,
  );

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as PlacePrediction[];
}
