// @vitest-environment jsdom
import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
    within,
} from '@testing-library/react';
import {afterEach, beforeEach, expect, it, vi} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import {AppProviders} from '../theme/app-provider';
import AppRouter from './app-routes';
import {SessionProvider} from '@/entities';
import {i18n} from '@/shared';

beforeEach(async () => {
    await i18n.changeLanguage('en');
    vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        })),
    );
    vi.stubGlobal(
        'ResizeObserver',
        class {
            observe = vi.fn();
            unobserve = vi.fn();
            disconnect = vi.fn();
        },
    );
});

afterEach(async () => {
    cleanup();
    localStorage.clear();
    await i18n.changeLanguage('en');
    vi.unstubAllGlobals();
});

function openApp(path: string): void {
    render(
        <AppProviders>
            <MemoryRouter initialEntries={[path]}>
                <SessionProvider>
                    <AppRouter />
                </SessionProvider>
            </MemoryRouter>
        </AppProviders>,
    );
}

it('switches login fields and existing server errors without losing input or rechecking the session', async () => {
    const request = vi.fn(async (path: string) =>
        Response.json(
            {
                error: path.endsWith('login')
                    ? 'invalid username or password'
                    : 'authentication required',
            },
            {status: 401},
        ),
    );
    vi.stubGlobal('fetch', request);
    openApp('/login');
    await screen.findByRole('button', {name: 'Sign in'});
    fireEvent.change(screen.getByLabelText('Username', {exact: false}), {
        target: {value: 'Ana'},
    });
    fireEvent.change(
        screen.getByLabelText('Password', {exact: false, selector: 'input'}),
        {target: {value: ' keep spaces '}},
    );
    fireEvent.click(screen.getByRole('button', {name: 'Sign in'}));
    await screen.findByText('invalid username or password');
    fireEvent.click(
        screen.getByRole('button', {
            name: 'Change language to Portuguese (Brazil)',
        }),
    );
    await screen.findByText('Usuário ou senha inválidos');
    expect(
        screen.getByLabelText<HTMLInputElement>('Usuário', {exact: false})
            .value,
    ).toBe('Ana');
    expect(
        screen.getByLabelText<HTMLInputElement>('Senha', {
            exact: false,
            selector: 'input',
        }).value,
    ).toBe(' keep spaces ');
    expect(document.documentElement.lang).toBe('pt-BR');
    expect(document.title).toBe('Controle de Ativos');
    expect(localStorage.getItem('asset-control-language')).toBe('pt-BR');
    expect(request).toHaveBeenCalledTimes(2);
    fireEvent.click(
        screen.getByRole('button', {name: 'Mudar idioma para Inglês'}),
    );
    await screen.findByText('invalid username or password');
    expect(document.documentElement.lang).toBe('en');
});

it.each([
    [
        '/employees',
        'Employees',
        'Colaboradores',
        'New employee',
        'Novo colaborador',
    ],
    ['/machines', 'Machines', 'Computadores', 'New machine', 'Novo computador'],
    ['/monitors', 'Monitors', 'Monitores', 'New monitor', 'Novo monitor'],
    ['/phones', 'Phones', 'Celulares', 'New phone', 'Novo celular'],
    ['/printers', 'Printers', 'Impressoras', 'New printer', 'Nova impressora'],
    ['/emails', 'Emails', 'E-mails', 'New email', 'Novo e-mail'],
])(
    'translates %s, its header, empty state, and open creation form',
    async (path, english, portuguese, newEnglish, newPortuguese) => {
        const request = vi.fn(async (url: string) =>
            Response.json({
                data:
                    url === '/api/auth/session'
                        ? {
                              id: '1',
                              name: 'A very long employee name that must not crowd header controls',
                              expires_at: Math.floor(Date.now() / 1000) + 3600,
                          }
                        : [],
            }),
        );
        vi.stubGlobal('fetch', request);
        openApp(path);
        await screen.findByRole('heading', {name: english});
        await screen.findAllByRole('button', {name: newEnglish});
        fireEvent.click(
            screen.getByRole('button', {
                name: 'Change language to Portuguese (Brazil)',
            }),
        );
        await screen.findByRole('heading', {name: portuguese});
        expect(screen.getByRole('button', {name: 'Sair'})).toBeDefined();
        const resource = path.slice(1);
        if (resource === 'phones') {
            fireEvent.click(
                screen.getByRole('tab', {name: 'Inventário de celulares'}),
            );
        }

        await screen.findByText(i18n.t(`resources.${resource}.empty`));
        fireEvent.click(
            screen.getAllByRole('button', {name: newPortuguese})[0],
        );
        const dialog = await screen.findByRole('dialog', {name: newPortuguese});
        expect(
            within(dialog).getByRole('button', {name: 'Cancelar'}),
        ).toBeDefined();
        expect(
            within(dialog).getByRole('button', {name: 'Fechar'}),
        ).toBeDefined();
        await act(async () => {
            await i18n.changeLanguage('en');
        });
        await screen.findByRole('dialog', {name: newEnglish});
        expect(
            within(dialog).getByRole('button', {name: 'Cancel'}),
        ).toBeDefined();
        expect(
            request.mock.calls.filter(([url]) => url === '/api/auth/session'),
        ).toHaveLength(1);
    },
);

it('translates the dashboard empty state and navigation', async () => {
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) =>
            Response.json({
                data:
                    url === '/api/auth/session'
                        ? {
                              id: '1',
                              name: 'Ana',
                              expires_at: Math.floor(Date.now() / 1000) + 3600,
                          }
                        : [],
            }),
        ),
    );
    openApp('/');
    await screen.findByText('No records yet');
    fireEvent.click(
        screen.getByRole('button', {
            name: 'Change language to Portuguese (Brazil)',
        }),
    );
    await screen.findByRole('heading', {name: 'Painel'});
    expect(screen.getByText('Nenhum registro ainda')).toBeDefined();
    expect(screen.getByRole('link', {name: 'Colaboradores'})).toBeDefined();
});
