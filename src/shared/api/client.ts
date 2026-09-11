export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

const configuredBaseUrl: unknown = import.meta.env.VITE_API_BASE_URL;
const baseUrl = (
    typeof configuredBaseUrl === 'string' ? configuredBaseUrl : '/api'
).replace(/\/$/u, '');

export async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    let response: Response;
    const headers = new Headers(options.headers);
    if (options.body !== undefined && options.body !== null) {
        headers.set('Content-Type', 'application/json');
    }

    try {
        response = await fetch(`${baseUrl}${path}`, {
            ...options,
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
        const body = (await response.json().catch(() => undefined)) as
            {error?: string} | undefined;
        throw new ApiError(
            body?.error ?? `Request failed (${response.status}).`,
            response.status,
        );
    }

    const body = (await response.json()) as {data: T};
    return body.data;
}
