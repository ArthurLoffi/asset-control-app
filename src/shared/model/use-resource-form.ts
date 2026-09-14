import {useRef, useState, type SubmitEvent} from 'react';
import type {FormResult} from './resource';

type ResourceFormOptions<T, Input> = {
    id?: number;
    parse: (data: FormData) => FormResult<Input>;
    api: {
        create: (input: Input) => Promise<T>;
        update: (id: number, input: Input) => Promise<T>;
    };
    onSaved: (record: T) => void;
    fallbackError: string;
};

export function useResourceForm<T, Input>({
    id,
    parse,
    api,
    onSaved,
    fallbackError,
}: ResourceFormOptions<T, Input>) {
    const pending = useRef(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (pending.current) {
            return;
        }

        const result = parse(new FormData(event.currentTarget));
        if (result.error !== undefined) {
            setError(result.error);
            return;
        }

        pending.current = true;
        setSaving(true);
        setError('');
        try {
            const record =
                id === undefined
                    ? await api.create(result.input)
                    : await api.update(id, result.input);
            onSaved(record);
        } catch (saveError) {
            setError(
                saveError instanceof Error ? saveError.message : fallbackError,
            );
        } finally {
            pending.current = false;
            setSaving(false);
        }
    }

    return {saving, error, handleSubmit};
}
