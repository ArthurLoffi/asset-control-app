import {describe, expect, it} from 'vitest';
import {resolveCompanyLogoSource} from './company-logo';

describe('resolveCompanyLogoSource', () => {
    it('resolves a configured header asset through Vite', () => {
        expect(
            resolveCompanyLogoSource('src/widgets/header/assets/logo.png'),
        ).toMatch(/logo\.png$/u);
    });

    it('passes external and public URLs through unchanged', () => {
        expect(
            resolveCompanyLogoSource('https://example.com/company.png'),
        ).toBe('https://example.com/company.png');
        expect(resolveCompanyLogoSource('/company.png')).toBe('/company.png');
    });

    it('omits missing and empty configuration', () => {
        expect(resolveCompanyLogoSource(undefined)).toBeUndefined();
        expect(resolveCompanyLogoSource(' '.repeat(3))).toBeUndefined();
    });
});
