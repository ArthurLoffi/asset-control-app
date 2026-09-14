import {emailApi} from '../api/email-api';
import type {EmailQuery} from './types';
import {useResourceQuery} from '@/shared';

export function useEmails(search: EmailQuery) {
    const {data: emails, ...state} = useResourceQuery(
        search,
        emailApi.list,
        'Unable to load emails.',
    );
    return {emails, ...state};
}
