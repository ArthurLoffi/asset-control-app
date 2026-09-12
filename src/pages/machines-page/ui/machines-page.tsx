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
    IconDeviceLaptop,
    IconPlus,
    IconRefresh,
    IconSearch,
} from '@tabler/icons-react';
import {
    useEmployees,
    useMachines,
    type Machine,
    type MachineSearch,
} from '@/entities';
import {MachineForm} from '@/features';

const pageSize = 10;
const allEmployeesSearch = {kind: 'all'} as const;

function formatDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) || date.getUTCFullYear() < 1900
        ? '—'
        : date.toLocaleDateString();
}

function includedLabel(value: Machine['has_keyboard']) {
    if (value === null) {
        return 'Unknown';
    }

    return value ? 'Included' : 'Not included';
}

function MachineRow({
    machine,
    employeeName,
    onEdit,
}: {
    machine: Machine;
    employeeName?: string;
    onEdit: (machine: Machine) => void;
}) {
    return (
        <Table.Tr>
            <Table.Td>
                <Text size="sm" fw={500}>
                    {machine.model}
                </Text>
                <Text size="xs" c="dimmed">
                    {machine.type} · ID #{machine.id}
                </Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm">{machine.serial_number}</Text>
                <Text size="xs" c="dimmed">
                    {machine.asset_number === null
                        ? 'No asset number'
                        : `Asset #${machine.asset_number}`}
                </Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm">{machine.user}</Text>
                <Text size="xs" c="dimmed">
                    {machine.employee_id === null
                        ? 'Unassigned'
                        : (employeeName ?? 'Employee not found')}
                </Text>
            </Table.Td>
            <Table.Td>
                <Badge variant="outline" color="gray">
                    {machine.machine_condition ?? 'Not specified'}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Text size="xs">
                    Keyboard: {includedLabel(machine.has_keyboard)}
                </Text>
                <Text size="xs">Mouse: {includedLabel(machine.has_mouse)}</Text>
            </Table.Td>
            <Table.Td>
                <Badge variant="light">{machine.situation}</Badge>
            </Table.Td>
            <Table.Td>
                <Text size="sm" c="dimmed">
                    {formatDate(machine.created_at)}
                </Text>
            </Table.Td>
            <Table.Td>
                <Button
                    variant="subtle"
                    size="xs"
                    aria-label={`Edit ${machine.model}`}
                    onClick={() => {
                        onEdit(machine);
                    }}
                >
                    Edit
                </Button>
            </Table.Td>
        </Table.Tr>
    );
}

export function MachinesPage() {
    const [search, setSearch] = useState<MachineSearch>({kind: 'all'});
    const [searchKind, setSearchKind] = useState<'id' | 'employee_name'>(
        'employee_name',
    );
    const [query, setQuery] = useState('');
    const [searchError, setSearchError] = useState('');
    const [page, setPage] = useState(1);
    const [form, setForm] = useState<{machine?: Machine} | undefined>();
    const [notice, setNotice] = useState('');
    const {machines, loading, error, reload} = useMachines(search);
    const {employees} = useEmployees(allEmployeesSearch);
    const employeeNames = useMemo(
        () => new Map(employees.map(({id, name}) => [id, name])),
        [employees],
    );
    const totalPages = Math.max(1, Math.ceil(machines.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const firstMachineIndex = (currentPage - 1) * pageSize;
    const visibleMachines = machines.slice(
        firstMachineIndex,
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
                            <IconDeviceLaptop size={26} />
                        </ThemeIcon>
                        <div>
                            <Title order={1} size="h2">
                                Machines
                            </Title>
                            <Text c="dimmed" size="sm">
                                Manage computers, assignments, and equipment
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
                        New machine
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
                                    Machine inventory
                                </Title>
                                {!loading && error.length === 0 && (
                                    <Badge variant="light">
                                        {machines.length}{' '}
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
                                            {value: 'id', label: 'Machine ID'},
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
                                                ? 'Machine ID'
                                                : 'Employee name'
                                        }
                                        placeholder={
                                            searchKind === 'id'
                                                ? 'Enter a machine ID'
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
                                        Loading machines…
                                    </Text>
                                </Stack>
                            </Center>
                        ) : error.length > 0 ? (
                            <Alert
                                color="red"
                                title="Unable to load machines"
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
                        ) : machines.length === 0 ? (
                            <Stack align="center" py={60} gap="sm">
                                <ThemeIcon
                                    size={56}
                                    variant="light"
                                    color="gray"
                                    radius="xl"
                                >
                                    <IconDeviceLaptop size={28} />
                                </ThemeIcon>
                                <Title order={3} size="h4">
                                    {search.kind === 'all'
                                        ? 'No machines yet'
                                        : 'No machine found'}
                                </Title>
                                <Text c="dimmed" size="sm" ta="center">
                                    {search.kind === 'all'
                                        ? 'Add your first machine to start the inventory.'
                                        : 'Check the machine ID or employee name and try again.'}
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
                                        ? 'New machine'
                                        : 'Show all machines'}
                                </Button>
                            </Stack>
                        ) : (
                            <>
                                <Table.ScrollContainer minWidth={1100}>
                                    <Table
                                        verticalSpacing="md"
                                        highlightOnHover
                                        aria-label="Machine inventory"
                                    >
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>Machine</Table.Th>
                                                <Table.Th>
                                                    Identification
                                                </Table.Th>
                                                <Table.Th>Assignment</Table.Th>
                                                <Table.Th>Condition</Table.Th>
                                                <Table.Th>Peripherals</Table.Th>
                                                <Table.Th>Situation</Table.Th>
                                                <Table.Th>Added</Table.Th>
                                                <Table.Th>Actions</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {visibleMachines.map((machine) => (
                                                <MachineRow
                                                    key={machine.id}
                                                    machine={machine}
                                                    employeeName={
                                                        machine.employee_id ===
                                                        null
                                                            ? undefined
                                                            : employeeNames.get(
                                                                  machine.employee_id,
                                                              )
                                                    }
                                                    onEdit={(
                                                        selectedMachine,
                                                    ) => {
                                                        setNotice('');
                                                        setForm({
                                                            machine:
                                                                selectedMachine,
                                                        });
                                                    }}
                                                />
                                            ))}
                                        </Table.Tbody>
                                    </Table>
                                </Table.ScrollContainer>
                                <Group justify="space-between">
                                    <Text size="sm" c="dimmed">
                                        Showing {firstMachineIndex + 1}–
                                        {Math.min(
                                            currentPage * pageSize,
                                            machines.length,
                                        )}{' '}
                                        of {machines.length} machines
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
                <MachineForm
                    machine={form.machine}
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
