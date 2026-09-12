import {useMemo, useState, type SubmitEvent} from 'react';
import {
    Alert,
    Badge,
    Button,
    Center,
    Container,
    Group,
    Loader,
    Pagination,
    Paper,
    Select,
    Stack,
    Table,
    Text,
    TextInput,
    ThemeIcon,
    Title,
} from '@mantine/core';
import {
    IconDeviceDesktop,
    IconPlus,
    IconRefresh,
    IconSearch,
} from '@tabler/icons-react';
import {useEmployees} from '@/entities/employee/index.js';
import {
    useMonitors,
    type Monitor,
    type MonitorSearch,
} from '@/entities/monitor/index.js';
import {MonitorForm} from '@/features/monitor-form/index.js';

const pageSize = 10;
const allEmployeesSearch = {kind: 'all'} as const;

function formatDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) || date.getUTCFullYear() < 1900
        ? '—'
        : date.toLocaleDateString();
}

function MonitorRow({
    monitor,
    employeeName,
    onEdit,
}: {
    monitor: Monitor;
    employeeName?: string;
    onEdit: (monitor: Monitor) => void;
}) {
    return (
        <Table.Tr>
            <Table.Td>
                <Text size="sm" fw={500}>
                    {monitor.model}
                </Text>
                <Text size="xs" c="dimmed">
                    {monitor.brand ?? 'Brand not specified'} · ID #{monitor.id}
                </Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm">{monitor.serial_number ?? '—'}</Text>
                <Text size="xs" c="dimmed">
                    {monitor.asset_number === null
                        ? 'No asset number'
                        : `Asset #${monitor.asset_number}`}
                </Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm">
                    {monitor.employee_id === null
                        ? 'Unassigned'
                        : (employeeName ?? 'Employee not found')}
                </Text>
            </Table.Td>
            <Table.Td>
                <Badge variant="outline" color="gray">
                    {monitor.monitor_condition ?? 'Not specified'}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Badge variant="light">{monitor.situation}</Badge>
            </Table.Td>
            <Table.Td>
                <Text size="sm" c="dimmed">
                    {formatDate(monitor.created_at)}
                </Text>
            </Table.Td>
            <Table.Td>
                <Button
                    variant="subtle"
                    size="xs"
                    aria-label={`Edit ${monitor.model}`}
                    onClick={() => {
                        onEdit(monitor);
                    }}
                >
                    Edit
                </Button>
            </Table.Td>
        </Table.Tr>
    );
}

export function MonitorsPage() {
    const [search, setSearch] = useState<MonitorSearch>({kind: 'all'});
    const [searchKind, setSearchKind] = useState<'id' | 'employee_name'>('id');
    const [query, setQuery] = useState('');
    const [searchError, setSearchError] = useState('');
    const [page, setPage] = useState(1);
    const [form, setForm] = useState<{monitor?: Monitor} | undefined>();
    const [notice, setNotice] = useState('');
    const {monitors, loading, error, reload} = useMonitors(search);
    const {employees} = useEmployees(allEmployeesSearch);
    const employeeNames = useMemo(
        () => new Map(employees.map(({id, name}) => [id, name])),
        [employees],
    );
    const totalPages = Math.max(1, Math.ceil(monitors.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const firstMonitorIndex = (currentPage - 1) * pageSize;
    const visibleMonitors = monitors.slice(
        firstMonitorIndex,
        currentPage * pageSize,
    );

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
            searchKind === 'id' &&
            (!/^\d+$/u.test(value) ||
                !Number.isSafeInteger(Number(value)) ||
                Number(value) <= 0)
        ) {
            setSearchError('Enter a valid positive ID.');
            return;
        }

        setSearchError('');
        setSearch({kind: searchKind, value});
        setPage(1);
    }

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                <Group justify="space-between">
                    <Group>
                        <ThemeIcon size={48} radius="md" variant="light">
                            <IconDeviceDesktop size={26} />
                        </ThemeIcon>
                        <div>
                            <Title order={1} size="h2">
                                Monitors
                            </Title>
                            <Text c="dimmed" size="sm">
                                Manage displays, assignments, and equipment
                                status.
                            </Text>
                        </div>
                    </Group>
                    <Button
                        leftSection={<IconPlus size={18} />}
                        onClick={() => {
                            setNotice('');
                            setForm({});
                        }}
                    >
                        New monitor
                    </Button>
                </Group>

                {notice.length > 0 && (
                    <Alert
                        color="green"
                        role="status"
                        withCloseButton
                        onClose={() => {
                            setNotice('');
                        }}
                    >
                        {notice}
                    </Alert>
                )}

                <Paper withBorder p="lg">
                    <Stack gap="lg">
                        <Group justify="space-between">
                            <Group gap="sm">
                                <Title order={2} size="h4">
                                    Monitor inventory
                                </Title>
                                {!loading && error.length === 0 && (
                                    <Badge variant="light">
                                        {monitors.length}{' '}
                                        {search.kind === 'all'
                                            ? 'total'
                                            : 'found'}
                                    </Badge>
                                )}
                            </Group>
                            <Button
                                variant="subtle"
                                size="xs"
                                leftSection={<IconRefresh size={16} />}
                                disabled={loading}
                                onClick={reload}
                            >
                                Refresh
                            </Button>
                        </Group>

                        <form onSubmit={handleSearch}>
                            <Stack gap="xs">
                                <Group align="flex-end">
                                    <Select
                                        label="Search by"
                                        w={180}
                                        value={searchKind}
                                        allowDeselect={false}
                                        data={[
                                            {value: 'id', label: 'Monitor ID'},
                                            {
                                                value: 'employee_name',
                                                label: 'Employee name',
                                            },
                                        ]}
                                        onChange={(value) => {
                                            setSearchKind(
                                                value === 'employee_name'
                                                    ? 'employee_name'
                                                    : 'id',
                                            );
                                            setQuery('');
                                            setSearchError('');
                                        }}
                                    />
                                    <TextInput
                                        label={
                                            searchKind === 'id'
                                                ? 'Monitor ID'
                                                : 'Employee name'
                                        }
                                        placeholder={
                                            searchKind === 'id'
                                                ? 'Enter a positive ID'
                                                : 'Enter an employee name'
                                        }
                                        leftSection={<IconSearch size={16} />}
                                        value={query}
                                        onChange={(event) => {
                                            setQuery(event.currentTarget.value);
                                        }}
                                        style={{flex: 1, minWidth: 180}}
                                    />
                                    <Button type="submit">Search</Button>
                                    {(search.kind !== 'all' ||
                                        query.length > 0) && (
                                        <Button
                                            variant="default"
                                            onClick={resetSearch}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </Group>
                                {searchError.length > 0 && (
                                    <Text c="red" size="sm" role="alert">
                                        {searchError}
                                    </Text>
                                )}
                            </Stack>
                        </form>

                        {loading ? (
                            <Center py={70}>
                                <Stack align="center">
                                    <Loader size="sm" />
                                    <Text size="sm" c="dimmed" role="status">
                                        Loading monitors…
                                    </Text>
                                </Stack>
                            </Center>
                        ) : error.length > 0 ? (
                            <Alert
                                color="red"
                                title="Unable to load monitors"
                                role="alert"
                            >
                                <Stack gap="sm">
                                    <Text size="sm">{error}</Text>
                                    <Button
                                        variant="light"
                                        color="red"
                                        size="xs"
                                        onClick={reload}
                                        style={{alignSelf: 'flex-start'}}
                                    >
                                        Try again
                                    </Button>
                                </Stack>
                            </Alert>
                        ) : monitors.length === 0 ? (
                            <Stack align="center" py={60} gap="sm">
                                <ThemeIcon
                                    size={56}
                                    variant="light"
                                    color="gray"
                                    radius="xl"
                                >
                                    <IconDeviceDesktop size={28} />
                                </ThemeIcon>
                                <Title order={3} size="h4">
                                    {search.kind === 'all'
                                        ? 'No monitors yet'
                                        : 'No monitor found'}
                                </Title>
                                <Text c="dimmed" size="sm" ta="center">
                                    {search.kind === 'all'
                                        ? 'Add your first monitor to start the inventory.'
                                        : 'Check the search value and try again.'}
                                </Text>
                                <Button
                                    variant="light"
                                    onClick={
                                        search.kind === 'all'
                                            ? () => {
                                                  setForm({});
                                              }
                                            : resetSearch
                                    }
                                >
                                    {search.kind === 'all'
                                        ? 'New monitor'
                                        : 'Show all monitors'}
                                </Button>
                            </Stack>
                        ) : (
                            <>
                                <Table.ScrollContainer minWidth={950}>
                                    <Table
                                        verticalSpacing="md"
                                        highlightOnHover
                                        aria-label="Monitor inventory"
                                    >
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>Monitor</Table.Th>
                                                <Table.Th>
                                                    Identification
                                                </Table.Th>
                                                <Table.Th>Employee</Table.Th>
                                                <Table.Th>Condition</Table.Th>
                                                <Table.Th>Situation</Table.Th>
                                                <Table.Th>Added</Table.Th>
                                                <Table.Th>Actions</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {visibleMonitors.map((monitor) => (
                                                <MonitorRow
                                                    key={monitor.id}
                                                    monitor={monitor}
                                                    employeeName={
                                                        monitor.employee_id ===
                                                        null
                                                            ? undefined
                                                            : employeeNames.get(
                                                                  monitor.employee_id,
                                                              )
                                                    }
                                                    onEdit={(
                                                        selectedMonitor,
                                                    ) => {
                                                        setNotice('');
                                                        setForm({
                                                            monitor:
                                                                selectedMonitor,
                                                        });
                                                    }}
                                                />
                                            ))}
                                        </Table.Tbody>
                                    </Table>
                                </Table.ScrollContainer>
                                <Group justify="space-between">
                                    <Text size="sm" c="dimmed">
                                        Showing {firstMonitorIndex + 1}–
                                        {Math.min(
                                            currentPage * pageSize,
                                            monitors.length,
                                        )}{' '}
                                        of {monitors.length} monitors
                                    </Text>
                                    {totalPages > 1 && (
                                        <Pagination
                                            total={totalPages}
                                            value={currentPage}
                                            onChange={setPage}
                                            size="sm"
                                        />
                                    )}
                                </Group>
                            </>
                        )}
                    </Stack>
                </Paper>
            </Stack>
            {form && (
                <MonitorForm
                    monitor={form.monitor}
                    onClose={() => {
                        setForm(undefined);
                    }}
                    onSaved={(message) => {
                        setForm(undefined);
                        setNotice(message);
                        resetSearch();
                    }}
                />
            )}
        </Container>
    );
}
