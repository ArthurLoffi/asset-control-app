import type {Email, EmailInput, EmailSearch, EmailQuery} from '../model/types';
import {createResourceWriter, findResource, listAll} from '@/shared';

export const emailApi = {
    ...createResourceWriter<Email, EmailInput>('/emails'),
    async list(search: EmailQuery, signal: AbortSignal): Promise<Email[]> {
        return search.kind === 'all'
            ? listAll<Email>('/emails', {}, signal)
            : emailApi.find(search, signal);
    },
    async find(search: EmailSearch, signal: AbortSignal): Promise<Email[]> {
        return findResource<Email>('/emails', search, signal);
    },
};
