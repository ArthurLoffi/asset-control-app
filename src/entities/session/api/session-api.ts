import type {LoginInput, Session} from '../model/types';
import {apiRequest} from '@/shared';

export const sessionApi = {
    async current(signal: AbortSignal): Promise<Session> {
        return apiRequest<Session>('/auth/session', {signal});
    },
    async login(input: LoginInput): Promise<Session> {
        return apiRequest<Session>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(input),
        });
    },
    async logout(): Promise<undefined> {
        return apiRequest<undefined>('/auth/logout', {method: 'POST'});
    },
};
