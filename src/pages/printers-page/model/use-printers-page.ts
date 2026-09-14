import {useMemo, useState, type SubmitEvent} from 'react';
import {
    useOrganizations,
    usePrinters,
    type Printer,
    type PrinterSearch,
} from '@/entities';

const pageSize = 10;

export function formatPrinterDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) || date.getUTCFullYear() < 1900
        ? '—'
        : date.toLocaleDateString();
}

export function usePrintersPage() {
    const [search, setSearch] = useState<PrinterSearch>({kind: 'all'});
    const [query, setQuery] = useState('');
    const [searchError, setSearchError] = useState('');
    const [page, setPage] = useState(1);
    const [form, setForm] = useState<{printer?: Printer} | undefined>();
    const [notice, setNotice] = useState('');
    const {printers, loading, error, reload} = usePrinters(search);
    const organizations = useOrganizations();
    const branchNames = useMemo(
        () => new Map(organizations.branches.map(({id, name}) => [id, name])),
        [organizations.branches],
    );
    const departmentNames = useMemo(
        () =>
            new Map(organizations.departments.map(({id, name}) => [id, name])),
        [organizations.departments],
    );
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

        if (
            !/^\d+$/u.test(value) ||
            !Number.isSafeInteger(Number(value)) ||
            Number(value) <= 0
        ) {
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
        reload,
        search,
        query,
        setQuery,
        searchError,
        currentPage,
        totalPages,
        setPage,
        firstIndex,
        lastIndex,
        visiblePrinters: printers.slice(firstIndex, lastIndex),
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
