type Nullable<T> = T | null; // eslint-disable-line @typescript-eslint/no-restricted-types

export function effectiveValues<T>(first: Nullable<T>, values?: T[]): T[] {
    return values ?? (first === null ? [] : [first]);
}

export function formatValues<T>(
    first: Nullable<T>,
    values: T[] | undefined,
    format: (value: T) => string,
): string | undefined {
    const text = effectiveValues(first, values)
        .map((value) => format(value))
        .join(', ');
    return text.length === 0 ? undefined : text;
}

export function splitValues(value: string): string[] {
    return value
        .split(/[\n,]/u)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
}

export function parseEmployeeIds(value: string): number[] | undefined {
    const entries = splitValues(value);
    const ids = entries.map(Number);
    if (
        ids.some((id) => !Number.isSafeInteger(id) || id <= 0) ||
        new Set(ids).size !== ids.length
    ) {
        return undefined;
    }

    return ids;
}
