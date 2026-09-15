export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly code?: string,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

const configuredBaseUrl: unknown = import.meta.env.VITE_API_BASE_URL;
const baseUrl = (
    typeof configuredBaseUrl === 'string' ? configuredBaseUrl : '/api'
).replace(/\/$/u, '');

const unauthorizedListeners = new Set<() => void>();

export function onUnauthorized(listener: () => void): () => void {
    unauthorizedListeners.add(listener);
    return () => {
        unauthorizedListeners.delete(listener);
    };
}

export async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    let response: Response;
    const headers = new Headers(options.headers);
    headers.set('X-CSRF-Protection', '1');
    if (options.body !== undefined && options.body !== null) {
        headers.set('Content-Type', 'application/json');
    }

    try {
        response = await fetch(`${baseUrl}${path}`, {
            ...options,
            credentials: 'include',
            headers,
        });
    } catch (error) {
        if (options.signal?.aborted) {
            throw error;
        }

        throw new Error('Unable to connect to the server. Please try again.', {
            cause: error,
        });
    }

    if (!response.ok) {
        if (response.status === 401 && !path.startsWith('/auth/')) {
            if (options.signal?.aborted) {
                options.signal.throwIfAborted();
            }

            for (const listener of unauthorizedListeners) {
                listener();
            }
        }

        const body = (await response.json().catch(() => undefined)) as
            {error?: string; code?: string} | undefined;
        throw new ApiError(
            body?.error ?? `Request failed (${response.status}).`,
            response.status,
            body?.code,
        );
    }

    const body = (await response.json()) as {data: T};
    return body.data;
}
