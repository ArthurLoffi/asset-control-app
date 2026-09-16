import {useRef, useState, type SubmitEvent} from 'react';

type DeactivationOptions = {
    id?: number;
    deactivate: (id: number) => Promise<unknown>;
    onDeactivated: () => void;
};

export function useRecordDeactivation({
    id,
    deactivate,
    onDeactivated,
}: DeactivationOptions) {
    const [selected, setSelected] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const pending = useRef(false);

    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>,
    ): Promise<void> {
        event.preventDefault();
        if (id === undefined || !selected || pending.current) {
            return;
        }

        pending.current = true;
        setSaving(true);
        setError('');
        try {
            await deactivate(id);
            onDeactivated();
        } catch (error_) {
            setError(
                error_ instanceof Error
                    ? error_.message
                    : 'Unable to deactivate record.',
            );
        } finally {
            pending.current = false;
            setSaving(false);
        }
    }

    return {
        selected,
        saving,
        error,
        handleSubmit,
        setSelected(isSelected: boolean): void {
            setSelected(isSelected);
            setError('');
        },
    };
}
