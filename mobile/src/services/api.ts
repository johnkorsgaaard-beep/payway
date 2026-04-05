import { getItem, setItem, deleteItem } from '../utils/storage';
import { API_URL } from '../utils/constants';
import { isNetworkError } from '../hooks/useNetworkStatus';

const TOKEN_KEY = 'payway_token';
const REFRESH_TOKEN_KEY = 'payway_refresh_token';

export class NetworkError extends Error {
  readonly isOffline = true;
  constructor(message = 'Ingen internetforbindelse. Tjek din forbindelse og prøv igen.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ServerError extends Error {
  readonly statusCode: number;
  constructor(statusCode: number, message?: string) {
    super(message || getServerMessage(statusCode));
    this.name = 'ServerError';
    this.statusCode = statusCode;
  }
}

function getServerMessage(status: number): string {
  if (status >= 500) return 'Serveren er midlertidigt utilgængelig. Prøv igen om lidt.';
  if (status === 429) return 'For mange forsøg. Vent venligst et øjeblik.';
  if (status === 403) return 'Du har ikke adgang til denne funktion.';
  if (status === 404) return 'Den anmodede ressource blev ikke fundet.';
  return `Der opstod en fejl (${status}). Prøv igen.`;
}

export async function getToken(): Promise<string | null> {
  return getItem(TOKEN_KEY);
}

export async function setTokens(token: string, refreshToken: string): Promise<void> {
  await setItem(TOKEN_KEY, token);
  await setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export async function clearTokens(): Promise<void> {
  await deleteItem(TOKEN_KEY);
  await deleteItem(REFRESH_TOKEN_KEY);
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...headers, ...(options?.headers as Record<string, string>) },
    });
  } catch (err) {
    if (isNetworkError(err)) {
      throw new NetworkError();
    }
    throw new NetworkError('Kunne ikke forbinde til serveren. Tjek din internetforbindelse.');
  }

  if (res.status === 401) {
    const refreshToken = await getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshRes.ok) {
          const { token: newToken } = await refreshRes.json();
          await setItem(TOKEN_KEY, newToken);
          headers.Authorization = `Bearer ${newToken}`;
          const retryRes = await fetch(`${API_URL}${path}`, {
            ...options,
            headers,
          });
          if (retryRes.ok) return retryRes.json();
        }
      } catch {}
    }
    await clearTokens();
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ServerError(res.status, body.message);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
};
