import {Fieldset, Switch} from '@mantine/core';
import type {ReactElement, ReactNode} from 'react';
import {useTranslation} from 'react-i18next';

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
    const {t} = useTranslation();
    return (
        <>
            {editing && (
                <Switch
                    label={t('deactivation.label')}
                    aria-label={t('deactivation.label')}
                    description={t('deactivation.description')}
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
