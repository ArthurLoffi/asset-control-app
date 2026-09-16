import {Fieldset, Switch} from '@mantine/core';
import type {ReactElement, ReactNode} from 'react';

type DeactivationFieldsProps = {
    editing: boolean;
    selected: boolean;
    saving: boolean;
    onChange: (isSelected: boolean) => void;
    children: ReactNode;
};

export function DeactivationFields({
    editing,
    selected,
    saving,
    onChange,
    children,
}: DeactivationFieldsProps): ReactElement {
    return (
        <>
            {editing && (
                <Switch
                    label="Deactivate record"
                    aria-label="Deactivate record"
                    description="Save to remove this record from active lists and dashboard totals. Existing details will be preserved."
                    color="red"
                    checked={selected}
                    disabled={saving}
                    onChange={(event) => {
                        onChange(event.currentTarget.checked);
                    }}
                />
            )}
            <Fieldset
                variant="unstyled"
                disabled={saving || selected}
                style={{minWidth: 0, opacity: selected ? 0.5 : 1}}
            >
                {children}
            </Fieldset>
        </>
    );
}
