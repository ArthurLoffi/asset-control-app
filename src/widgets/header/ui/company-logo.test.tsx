// @vitest-environment jsdom
import {MantineProvider} from '@mantine/core';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import CompanyLogo from './company-logo';

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
    cleanup();
    vi.unstubAllGlobals();
});

describe('CompanyLogo', () => {
    it('renders nothing when no source is configured', () => {
        render(
            <MantineProvider env="test">
                <CompanyLogo source="" />
            </MantineProvider>,
        );

        expect(screen.queryByRole('img')).toBeNull();
    });

    it('hides a configured logo when the image cannot be loaded', () => {
        render(
            <MantineProvider env="test">
                <CompanyLogo source="/missing-logo.png" />
            </MantineProvider>,
        );

        fireEvent.error(screen.getByRole('img', {name: 'Company logo'}));

        expect(screen.queryByRole('img')).toBeNull();
    });
});
