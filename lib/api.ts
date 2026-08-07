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

  return fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  });
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
