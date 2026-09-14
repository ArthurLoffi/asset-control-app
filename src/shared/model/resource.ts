export type ResourceRecord = {id: number; created_at: string};
export type ResourceInput<T extends ResourceRecord> = Omit<
    T,
    keyof ResourceRecord
>;
export type LookupSearch<K extends string = 'id'> = {kind: K; value: string};
export type CollectionSearch<K extends string = 'id'> =
    LookupSearch<K> | {kind: 'all'};
export type FormResult<T> =
    {input: T; error?: never} | {input?: never; error: string};

export function isPositiveId(
    value: string,
    maximum = Number.MAX_SAFE_INTEGER,
): boolean {
    return (
        /^\d+$/u.test(value) &&
        Number.isSafeInteger(Number(value)) &&
        Number(value) > 0 &&
        Number(value) <= maximum
    );
}

export function formText(data: FormData, name: string): string {
    const value = data.get(name);
    return typeof value === 'string' ? value : '';
}

export function formatRecordDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) || date.getUTCFullYear() < 1900
        ? '—'
        : date.toLocaleDateString();
}
