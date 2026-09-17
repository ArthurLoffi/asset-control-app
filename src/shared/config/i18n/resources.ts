import {messageTranslations} from './messages';
import en from './locales/en/translation';
import ptBR from './locales/pt-br/translation';

export const defaultLanguage = 'pt-BR';
export const supportedLanguages = ['pt-BR', 'en'] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export const translationResources = {
    'pt-BR': {
        translation: {
            ...ptBR,
            messages: Object.fromEntries(
                Object.entries(messageTranslations).map(([key, values]) => [
                    key,
                    values[1],
                ]),
            ),
        },
    },
    en: {
        translation: {
            ...en,
            messages: Object.fromEntries(
                Object.entries(messageTranslations).map(([key, values]) => [
                    key,
                    values[0],
                ]),
            ),
        },
    },
} as const;
