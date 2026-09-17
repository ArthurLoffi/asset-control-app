import {useCallback, useState, type SubmitEvent} from 'react';
import {
    useOrganizations,
    usePrinters,
    type Printer,
    type PrinterSearch,
} from '@/entities';
import {i18n, isPositiveId, sortableTimestamp, useTableSort} from '@/shared';

const pageSize = 10;
export type PrinterSortKey =
    | 'printer'
    | 'assetNumber'
    | 'ip'
    | 'branch'
    | 'department'
    | 'condition'
    | 'added';

type UsePrintersPageReturn = {
    printers: Printer[];
    loading: boolean;
    error: string | undefined;
    reload: () => void;

    search: PrinterSearch;
    query: string;
    setQuery: React.Dispatch<React.SetStateAction<string>>;
    searchError: string;

    currentPage: number;
    totalPages: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    firstIndex: number;
    lastIndex: number;

    visiblePrinters: Printer[];
    sort: ReturnType<typeof useTableSort<Printer, PrinterSortKey>>['sort'];
    toggleSort: (key: PrinterSortKey) => void;

    branchNames: Map<number, string>;
    departmentNames: Map<number, string>;

    organizationError: string | undefined;

    form: {printer?: Printer} | undefined;
    notice: string;

    resetSearch: () => void;
    handleSearch: (event: SubmitEvent<HTMLFormElement>) => void;

    openForm: (printer?: Printer) => void;
    closeForm: () => void;
    onSaved: (message: string) => void;
};

export function usePrintersPage(): UsePrintersPageReturn {
    const [search, setSearch] = useState<PrinterSearch>({kind: 'all'});
    const [query, setQuery] = useState('');
    const [searchError, setSearchError] = useState('');
    const [page, setPage] = useState(1);
    const [form, setForm] = useState<{printer?: Printer} | undefined>();
    const [notice, setNotice] = useState('');
    const {printers, loading, error, reload} = usePrinters(search);
    const organizations = useOrganizations();
    const {branchNames, departmentNames} = organizations;
    const getSortValue = useCallback(
        (printer: Printer, key: PrinterSortKey) => {
            switch (key) {
                case 'printer': {
                    return printer.model;
                }

                case 'assetNumber': {
                    return printer.asset_number;
                }

                case 'ip': {
                    return printer.ip;
                }

                case 'branch': {
                    return (
                        branchNames.get(printer.branch_id) ?? printer.branch_id
                    );
                }

                case 'department': {
                    return (
                        departmentNames.get(printer.departments_id) ??
                        printer.departments_id
                    );
                }

                case 'condition': {
                    return printer.machine_condition ?? undefined;
                }

                case 'added': {
                    return sortableTimestamp(printer.created_at);
                }
            }
        },
        [branchNames, departmentNames],
    );
    const {
        sort,
        sortedRecords,
        toggleSort: toggleTableSort,
    } = useTableSort(printers, getSortValue, i18n.language);
    const totalPages = Math.max(1, Math.ceil(printers.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const firstIndex = (currentPage - 1) * pageSize;
    const lastIndex = Math.min(currentPage * pageSize, printers.length);

    function resetSearch() {
        setQuery('');
        setSearchError('');
        setSearch({kind: 'all'});
        setPage(1);
    }

    function handleSearch(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const value = query.trim();
        if (value.length === 0) {
            resetSearch();
            return;
        }

        if (!isPositiveId(value)) {
            setSearchError('Enter a valid positive ID.');
            return;
        }

        setSearchError('');
        setSearch({kind: 'id', value});
        setPage(1);
    }

    return {
        printers,
        loading,
        error,
        reload(): void {
            reload();
            organizations.reload();
        },
        search,
        query,
        setQuery,
        searchError,
        currentPage,
        totalPages,
        setPage,
        firstIndex,
        lastIndex,
        visiblePrinters: sortedRecords.slice(firstIndex, lastIndex),
        sort,
        toggleSort(key: PrinterSortKey): void {
            toggleTableSort(key);
            setPage(1);
        },
        branchNames,
        departmentNames,
        organizationError: organizations.error,
        form,
        notice,
        resetSearch,
        handleSearch,
        openForm(printer?: Printer) {
            setNotice('');
            setForm({printer});
        },
        closeForm() {
            setForm(undefined);
        },
        onSaved(message: string) {
            setForm(undefined);
            setNotice(message);
            resetSearch();
        },
    };
}
