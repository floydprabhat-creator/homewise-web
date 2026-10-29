import type { ApiErrorBody } from '@/types/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiOptions = Omit<RequestInit, 'body'> & { body?: unknown };

export async function api<T>(path: string, { body, headers, ...init }: ApiOptions = {}): Promise<T> {
  const isFormData = body instanceof FormData;

  const res = await fetch(`/api${path}`, {
    ...init,
    credentials: 'include',
    headers: isFormData ? headers : { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = (data as ApiErrorBody | null)?.error;
    throw new ApiError(
      res.status,
      error?.code ?? 'UNKNOWN',
      error?.message ?? 'Something went wrong. Please try again.',
      error?.fields,
    );
  }

  return data as T;
}
