import {useEffect, useState} from 'react';

type QueryState<T, Search> = {
    search: Search;
    revision: number;
    data: T[];
    error: string;
};

// Keep loaders stable (module-level functions). An undefined search is idle.
export function useResourceQuery<T, Search>(
    search: Search | undefined,
    load: (search: Search, signal: AbortSignal) => Promise<T[]>,
    fallbackError: string,
) {
    const [revision, setRevision] = useState(0);
    const [state, setState] = useState<QueryState<T, Search>>();

    useEffect(() => {
        if (search === undefined) {
            setState(undefined);
            return;
        }

        const controller = new AbortController();
        void load(search, controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) {
                    setState({search, revision, data, error: ''});
                }
            })
            .catch((error: unknown) => {
                if (!controller.signal.aborted) {
                    setState({
                        search,
                        revision,
                        data: [],
                        error:
                            error instanceof Error
                                ? error.message
                                : fallbackError,
                    });
                }
            });
        return () => {
            controller.abort();
        };
    }, [search, revision, load, fallbackError]);

    const current =
        search !== undefined &&
        state?.search === search &&
        state.revision === revision
            ? state
            : undefined;
    return {
        data: current?.data ?? [],
        loading: search !== undefined && current === undefined,
        error: current?.error ?? '',
        reload() {
            setRevision((value) => value + 1);
        },
    };
}
