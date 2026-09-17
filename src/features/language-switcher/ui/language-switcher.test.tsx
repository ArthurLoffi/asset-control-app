// @vitest-environment jsdom
import {MantineProvider} from '@mantine/core';
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {LanguageSwitcher} from './language-switcher';
import {defaultLanguage, i18n} from '@/shared';

beforeEach(() => {
    vi.stubGlobal(
        'matchMedia',
        vi.fn().mockImplementation(() => ({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        })),
    );
});

afterEach(() => {
    localStorage.clear();
    void i18n.changeLanguage('en');
    cleanup();
    vi.unstubAllGlobals();
});

describe('LanguageSwitcher', () => {
    it('changes the language and persists the selected locale', async () => {
        await i18n.changeLanguage(defaultLanguage);
        render(
            <MantineProvider env="test">
                <LanguageSwitcher />
            </MantineProvider>,
        );

        const switchButton = await screen.findByRole('button', {
            name: 'Mudar idioma para Inglês',
        });
        fireEvent.click(switchButton);

        await waitFor(() => {
            expect(
                screen.getByRole('button', {
                    name: 'Change language to Portuguese (Brazil)',
                }),
            ).toBeDefined();
        });
        expect(localStorage.getItem('asset-control-language')).toBe('en');
    });
});
