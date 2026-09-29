export function uniqueRecordsById<T extends {id: number}>(records: T[]): T[] {
    const seen = new Set<number>();
    return records.filter((record) => {
        if (seen.has(record.id)) {
            return false;
        }

        seen.add(record.id);
        return true;
    });
}
