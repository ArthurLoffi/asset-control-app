import type {Email, EmailInput, EmailSearch, EmailQuery} from '../model/types';
import {apiRequest, createResourceWriter, findResource} from '@/shared';

export const emailApi = {
    ...createResourceWriter<Email, EmailInput>('/emails'),
    async list(search: EmailQuery, signal: AbortSignal): Promise<Email[]> {
        if (search.kind === 'all') {
            return (
                (await apiRequest<Email[] | undefined>('/emails', {signal})) ??
                []
            );
        }

        return emailApi.find(search, signal);
    },
    async find(search: EmailSearch, signal: AbortSignal): Promise<Email[]> {
        return findResource<Email>('/emails', search, signal);
    },
};
