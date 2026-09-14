import type {
    CollectionSearch,
    LookupSearch,
    ResourceInput,
    ResourceRecord,
} from '@/shared';

export type Email = ResourceRecord & {
    user: string;
    email: string;
    password_hash: string;
};
export type EmailInput = ResourceInput<Email>;
export type EmailSearch = LookupSearch<'id' | 'user'>;
export type EmailQuery = CollectionSearch<EmailSearch['kind']>;
export const maximumEmailId = 2_147_483_647;
