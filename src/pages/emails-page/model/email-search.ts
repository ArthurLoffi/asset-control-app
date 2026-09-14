import {maximumEmailId, type EmailSearch} from '@/entities';
import {isPositiveId} from '@/shared';

export function validateEmailSearch(
    kind: EmailSearch['kind'],
    query: string,
): string {
    const value = query.trim();
    if (value.length === 0) {
        return kind === 'id' ? 'Enter an email ID.' : 'Enter a user to search.';
    }

    if (kind === 'id' && !isPositiveId(value, maximumEmailId)) {
        return `Enter a whole-number ID from 1 to ${maximumEmailId}.`;
    }

    return '';
}
