import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import {
    defaultLanguage,
    supportedLanguages,
    translationResources,
    type SupportedLanguage,
} from './resources';

const languageStorageKey = 'asset-control-language';

function isSupportedLanguage(value: string): value is SupportedLanguage {
    return (supportedLanguages as readonly string[]).includes(value);
}

function getBrowserLanguage(): SupportedLanguage | undefined {
    const browserLanguage = globalThis.navigator?.language?.toLowerCase();
    if (browserLanguage?.startsWith('pt')) {
        return 'pt-BR';
    }

    if (browserLanguage?.startsWith('en')) {
        return 'en';
    }

    return undefined;
}

function getInitialLanguage(): SupportedLanguage {
    try {
        const storedLanguage =
            globalThis.localStorage?.getItem(languageStorageKey);
        if (storedLanguage !== null && isSupportedLanguage(storedLanguage)) {
            return storedLanguage;
        }

        return getBrowserLanguage() ?? defaultLanguage;
    } catch {
        return getBrowserLanguage() ?? defaultLanguage;
    }
}

export function persistLanguage(language: SupportedLanguage): void {
    try {
        globalThis.localStorage?.setItem(languageStorageKey, language);
    } catch {
        // A blocked or unavailable storage should not prevent language changes.
    }
}

function createI18n(): typeof i18next {
    const instance = i18next.createInstance();
    void instance.use(initReactI18next).init({
        compatibilityJSON: 'v4',
        fallbackLng: defaultLanguage,
        interpolation: {
            escapeValue: false,
        },
        lng: getInitialLanguage(),
        resources: translationResources,
        supportedLngs: supportedLanguages,
    });
    return instance;
}

export const i18n = createI18n();
