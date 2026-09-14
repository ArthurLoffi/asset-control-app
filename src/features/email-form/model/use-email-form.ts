import {parseEmailForm} from './email-form';
import {emailApi, type Email} from '@/entities';
import {useResourceForm} from '@/shared';

export type EmailFormProps = {
    email?: Email;
    onClose: () => void;
    onSaved: (email: Email) => void;
};

export function useEmailForm({email, onSaved}: EmailFormProps) {
    return useResourceForm({
        id: email?.id,
        parse: parseEmailForm,
        api: emailApi,
        onSaved,
        fallbackError: 'Unable to save email.',
    });
}
