import {useTranslation} from 'react-i18next';
import {
    i18n,
    persistLanguage,
    supportedLanguages,
    type SupportedLanguage,
} from '@/shared';

type LanguageOption = {
    code: SupportedLanguage;
    label: string;
};

export function useLanguageSwitcher(): {
    currentLanguage: SupportedLanguage;
    nextLanguage: LanguageOption;
    changeLanguage: () => void;
} {
    const {t} = useTranslation();
    const currentLanguage: SupportedLanguage = supportedLanguages.includes(
        i18n.language as SupportedLanguage,
    )
        ? (i18n.language as SupportedLanguage)
        : supportedLanguages[0];
    const nextCode =
        currentLanguage === supportedLanguages[0]
            ? supportedLanguages[1]
            : supportedLanguages[0];

    return {
        changeLanguage() {
            void i18n.changeLanguage(nextCode);
            persistLanguage(nextCode);
        },
        currentLanguage,
        nextLanguage: {
            code: nextCode,
            label: t(
                `language.${nextCode === 'en' ? 'english' : 'portuguese'}`,
            ),
        },
    };
}
