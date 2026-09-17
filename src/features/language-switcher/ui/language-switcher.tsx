import {ActionIcon, Tooltip} from '@mantine/core';
import {IconWorld} from '@tabler/icons-react';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {useLanguageSwitcher} from '../model/use-language-switcher';

export function LanguageSwitcher(): ReactElement {
    const {t} = useTranslation();
    const {changeLanguage, nextLanguage} = useLanguageSwitcher();
    const label = t('language.switchTo', {language: nextLanguage.label});

    return (
        <Tooltip label={label} withArrow>
            <ActionIcon
                aria-label={label}
                onClick={changeLanguage}
                size="lg"
                style={{flexShrink: 0}}
                variant="subtle"
            >
                <IconWorld size={20} stroke={1.8} />
            </ActionIcon>
        </Tooltip>
    );
}
