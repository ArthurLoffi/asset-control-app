import {useState, type SubmitEvent} from 'react';
import {validateEmailSearch} from './email-search';
import {
    useEmails,
    type Email,
    type EmailSearch,
    type EmailQuery,
} from '@/entities';

const pageSize = 10;

export function useEmailsPage() {
    const [kind, setKind] = useState<EmailSearch['kind']>('user');
    const [query, setQuery] = useState('');
    const [search, setSearch] = useState<EmailQuery>({kind: 'all'});
    const [page, setPage] = useState(1);
    const [searchError, setSearchError] = useState('');
    const [form, setForm] = useState<{email?: Email}>();
    const [notice, setNotice] = useState('');
    const results = useEmails(search);
    const totalPages = Math.max(1, Math.ceil(results.emails.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const firstIndex = (currentPage - 1) * pageSize;
    const lastIndex = Math.min(currentPage * pageSize, results.emails.length);

    function resetSearch() {
        setQuery('');
        setSearch({kind: 'all'});
        setPage(1);
        setSearchError('');
        setNotice('');
    }

    function handleSearch(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (query.trim().length === 0) {
            resetSearch();
            return;
        }

        const error = validateEmailSearch(kind, query);
        setSearchError(error);
        if (error.length > 0) {
            return;
        }

        setNotice('');
        setSearch({kind, value: query.trim()});
        setPage(1);
    }

    return {
        ...results,
        currentPage,
        totalPages,
        setPage,
        firstIndex,
        lastIndex,
        visibleEmails: results.emails.slice(firstIndex, lastIndex),
        kind,
        query,
        setQuery,
        search,
        searchError,
        form,
        notice,
        resetSearch,
        handleSearch,
        changeKind(value: unknown) {
            if (!(value === 'user' || value === 'id')) {
                return;
            }

            setKind(value);
            resetSearch();
        },
        openForm(email?: Email) {
            setNotice('');
            setForm({email});
        },
        closeForm() {
            setForm(undefined);
        },
        onSaved(email: Email) {
            setNotice(
                form?.email
                    ? 'Email updated successfully.'
                    : 'Email created successfully.',
            );
            setForm(undefined);
            setKind('id');
            setQuery(String(email.id));
            setSearchError('');
            setSearch({kind: 'id', value: String(email.id)});
            setPage(1);
        },
    };
}
