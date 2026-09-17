import type {TFunction} from 'i18next';
import {messageTranslations} from './messages';

const messageKeys = new Map<string, string>();
for (const [key, translations] of Object.entries(messageTranslations)) {
    for (const message of translations) {
        messageKeys.set(message, key);
    }
}

/**
 Resolve known application messages at render time, so an open error or notice
 follows language changes. Unrecognized server messages remain intact.
 */
export function translateMessage(
    message: string | undefined,
    t: TFunction,
): string {
    if (message === undefined || message.length === 0) {
        return '';
    }

    const key = messageKeys.get(message);
    if (key !== undefined) {
        return t(`messages.${key}`);
    }

    const requestFailure = /^Request failed \((?<status>\d+)\)\.$/u.exec(
        message,
    );
    return requestFailure
        ? t('requestFailed', {status: requestFailure.groups?.status})
        : message;
}
