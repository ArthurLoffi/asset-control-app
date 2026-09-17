import {MantineProvider} from '@mantine/core';
import {ModalsProvider} from '@mantine/modals';
import {useEffect, type ReactElement, type ReactNode} from 'react';
import {I18nextProvider, useTranslation} from 'react-i18next';
import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/core/styles.css';
import {theme} from './theme';
// CSS side effects require their extension; local TypeScript imports do not.
// eslint-disable-next-line n/file-extension-in-import
import './responsive.css';
import {i18n} from '@/shared';

export const AppProviders = ({
    children,
}: {
    children: ReactNode;
}): ReactElement => {
    const {t} = useTranslation();
    const localizedTheme = {
        ...theme,
        components: {
            ...theme.components,
            Modal: {
                defaultProps: {
                    closeButtonProps: {'aria-label': t('common.actions.close')},
                },
            },
            Alert: {
                defaultProps: {closeButtonLabel: t('common.actions.close')},
            },
            PasswordInput: {
                defaultProps: {
                    visibilityToggleButtonProps: {
                        'aria-label': t('togglePasswordVisibility'),
                    },
                },
            },
            Pagination: {
                defaultProps: {
                    siblings: 0,
                    getItemProps: (page: number): Record<string, string> => ({
                        'aria-label': t('common.actions.page', {page}),
                    }),
                    getControlProps: (
                        control: string,
                    ): Record<string, string> => ({
                        'aria-label': t(`common.actions.${control}Page`),
                    }),
                },
            },
        },
    };
    useEffect(() => {
        const updateDocumentLanguage = (language: string): void => {
            document.documentElement.lang = language;
            document.title = i18n.t('app.name');
        };

        updateDocumentLanguage(i18n.language);
        i18n.on('languageChanged', updateDocumentLanguage);
        return () => {
            i18n.off('languageChanged', updateDocumentLanguage);
        };
    }, []);

    return (
        <MantineProvider theme={localizedTheme} defaultColorScheme="dark">
            <I18nextProvider i18n={i18n}>
                <ModalsProvider>{children}</ModalsProvider>
            </I18nextProvider>
        </MantineProvider>
    );
};
