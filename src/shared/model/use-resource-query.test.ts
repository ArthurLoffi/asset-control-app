// @vitest-environment jsdom
import {act, cleanup, renderHook, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {useResourceQuery} from './use-resource-query';

afterEach(cleanup);

function deferred() {
    let resolve!: (value: string[]) => void;
    // ES2023 is the project target; Promise.withResolvers requires ES2024.
    // eslint-disable-next-line unicorn/prefer-promise-with-resolvers
    const promise = new Promise<string[]>((done) => {
        resolve = done;
    });
    return {promise, resolve};
}

describe('resource query lifecycle', () => {
    it('does not fetch until a search is submitted and aborts when cleared', async () => {
        const load = vi.fn(async (_search: string, _signal: AbortSignal) => [
            'record',
        ]);
        const initialProps: {search?: string} = {search: undefined};
        const {result, rerender} = renderHook(
            ({search}: {search?: string}) =>
                useResourceQuery(search, load, 'Failed'),
            {initialProps},
        );
        expect(load).not.toHaveBeenCalled();
        expect(result.current.loading).toBe(false);
        rerender({search: 'Ana'});
        await waitFor(() => {
            expect(result.current.data).toEqual(['record']);
        });
        const signal = load.mock.calls[0][1];
        rerender({search: undefined});
        expect(signal.aborted).toBe(true);
        expect(result.current.data).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(load).toHaveBeenCalledTimes(1);
    });

    it('never replaces a newer result with an older response', async () => {
        const older = deferred();
        const newer = deferred();
        const load = vi
            .fn(async (_search: string, _signal: AbortSignal) => older.promise)
            .mockImplementationOnce(async () => older.promise)
            .mockImplementationOnce(async () => newer.promise);
        const {result, rerender} = renderHook(
            ({search}) => useResourceQuery(search, load, 'Failed'),
            {initialProps: {search: 'old'}},
        );
        rerender({search: 'new'});
        expect(load.mock.calls[0][1].aborted).toBe(true);
        expect(result.current.loading).toBe(true);
        await act(async () => {
            newer.resolve(['new']);
        });
        expect(result.current.data).toEqual(['new']);
        await act(async () => {
            older.resolve(['old']);
        });
        expect(result.current.data).toEqual(['new']);
    });

    it('shows failures and retries the active query', async () => {
        const load = vi
            .fn<(_search: string, _signal: AbortSignal) => Promise<string[]>>()
            .mockRejectedValueOnce(new Error('Offline'))
            .mockResolvedValueOnce(['recovered']);
        const {result} = renderHook(() =>
            useResourceQuery('Ana', load, 'Failed'),
        );
        await waitFor(() => {
            expect(result.current.error).toBe('Offline');
        });
        act(() => {
            result.current.reload();
        });
        expect(result.current.error).toBe('');
        await waitFor(() => {
            expect(result.current.data).toEqual(['recovered']);
        });
    });
});
