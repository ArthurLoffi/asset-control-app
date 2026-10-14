import {afterEach, expect, it, vi} from 'vitest';
import {employeeApi} from './employee-api';

const {signal} = new AbortController();

afterEach(() => {
    vi.unstubAllGlobals();
});

it('matches employee names partially, ignoring case, accents, and spaces', async () => {
    vi.stubGlobal(
        'fetch',
        vi.fn(async () =>
            Response.json({
                content: [
                    {id: 12, name: 'João Silva'},
                    {id: 13, name: 'Joanna Souza'},
                    {id: 14, name: 'Carlos Lima'},
                ],
                paging: {has_next: false},
            }),
        ),
    );
    await expect(
        employeeApi.findIdsByName('  JOAO  ', signal),
    ).resolves.toEqual([12]);
    await expect(employeeApi.findIdsByName('jo', signal)).resolves.toEqual([
        12, 13,
    ]);
    await expect(employeeApi.findIdsByName('  ', signal)).resolves.toEqual([]);
});
