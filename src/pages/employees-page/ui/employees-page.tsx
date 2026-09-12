import {useState, type SubmitEvent} from 'react';
import {
    Alert,
    Avatar,
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
    IconPlus,
    IconRefresh,
    IconSearch,
    IconUsers,
} from '@tabler/icons-react';
import {useEmployees, type Employee, type EmployeeSearch} from '@/entities';
import {EmployeeForm} from '@/features';

const pageSize = 10;

function formatDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) || date.getUTCFullYear() < 1900
        ? '—'
        : date.toLocaleDateString();
}

export function EmployeesPage() {
    const [search, setSearch] = useState<EmployeeSearch>({kind: 'all'});
    const [searchKind, setSearchKind] = useState('name');
    const [query, setQuery] = useState('');
    const [searchError, setSearchError] = useState('');
    const [page, setPage] = useState(1);
    const [form, setForm] = useState<{employee?: Employee} | undefined>();
    const [notice, setNotice] = useState('');
    const {employees, loading, error, reload} = useEmployees(search);
    const totalPages = Math.max(1, Math.ceil(employees.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const firstEmployeeIndex = (currentPage - 1) * pageSize;
    const visibleEmployees = employees.slice(
        firstEmployeeIndex,
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
            setSearchError('Enter a valid positive employee ID.');
            return;
        }

        setSearchError('');
        setSearch({kind: searchKind === 'id' ? 'id' : 'name', value});
        setPage(1);
    }

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                <Group justify="space-between">
                    <Group>
                        <ThemeIcon size={48} radius="md" variant="light">
                            <IconUsers size={26} />
                        </ThemeIcon>
                        <div>
                            <Title order={1} size="h2">
                                Employees
                            </Title>
                            <Text c="dimmed" size="sm">
                                Manage your team’s contact and organization
                                details.
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
                        New employee
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
                                    Employee directory
                                </Title>
                                {!loading && error.length === 0 && (
                                    <Badge variant="light">
                                        {employees.length}{' '}
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
                                        w={160}
                                        value={searchKind}
                                        allowDeselect={false}
                                        data={[
                                            {
                                                value: 'name',
                                                label: 'Name',
                                            },
                                            {value: 'id', label: 'Employee ID'},
                                        ]}
                                        onChange={(value) => {
                                            setSearchKind(value ?? 'name');
                                            setSearchError('');
                                        }}
                                    />
                                    <TextInput
                                        label={
                                            searchKind === 'id'
                                                ? 'Employee ID'
                                                : 'Employee name'
                                        }
                                        placeholder={
                                            searchKind === 'id'
                                                ? 'Enter an employee ID'
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
                                        Loading employees…
                                    </Text>
                                </Stack>
                            </Center>
                        ) : error.length > 0 ? (
                            <Alert
                                color="red"
                                title="Unable to load employees"
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
                        ) : employees.length === 0 ? (
                            <Stack align="center" py={60} gap="sm">
                                <ThemeIcon
                                    size={56}
                                    variant="light"
                                    color="gray"
                                    radius="xl"
                                >
                                    <IconUsers size={28} />
                                </ThemeIcon>
                                <Title order={3} size="h4">
                                    {search.kind === 'all'
                                        ? 'No employees yet'
                                        : 'No employee found'}
                                </Title>
                                <Text c="dimmed" size="sm" ta="center">
                                    {search.kind === 'all'
                                        ? 'Add your first employee to start building your directory.'
                                        : 'Check the name or employee ID and try again.'}
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
                                        ? 'New employee'
                                        : 'Show all employees'}
                                </Button>
                            </Stack>
                        ) : (
                            <>
                                <Table.ScrollContainer minWidth={820}>
                                    <Table
                                        verticalSpacing="md"
                                        highlightOnHover
                                        aria-label="Employee directory"
                                    >
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>Employee</Table.Th>
                                                <Table.Th>Contact</Table.Th>
                                                <Table.Th>Branch</Table.Th>
                                                <Table.Th>Department</Table.Th>
                                                <Table.Th>Added</Table.Th>
                                                <Table.Th>Actions</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {visibleEmployees.map(
                                                (employee) => (
                                                    <Table.Tr key={employee.id}>
                                                        <Table.Td>
                                                            <Group
                                                                wrap="nowrap"
                                                                gap="sm"
                                                            >
                                                                <Avatar
                                                                    color="brand"
                                                                    radius="xl"
                                                                >
                                                                    {employee.name
                                                                        .trim()
                                                                        .split(
                                                                            /\s+/u,
                                                                        )
                                                                        .slice(
                                                                            0,
                                                                            2,
                                                                        )
                                                                        .map(
                                                                            (
                                                                                part,
                                                                            ) =>
                                                                                part[0],
                                                                        )
                                                                        .join(
                                                                            '',
                                                                        )
                                                                        .toUpperCase()}
                                                                </Avatar>
                                                                <div>
                                                                    <Text
                                                                        size="sm"
                                                                        fw={500}
                                                                    >
                                                                        {
                                                                            employee.name
                                                                        }
                                                                    </Text>
                                                                    <Text
                                                                        size="xs"
                                                                        c="dimmed"
                                                                    >
                                                                        ID #
                                                                        {
                                                                            employee.id
                                                                        }
                                                                    </Text>
                                                                </div>
                                                            </Group>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Text size="sm">
                                                                {employee.email
                                                                    .length > 0
                                                                    ? employee.email
                                                                    : '—'}
                                                            </Text>
                                                            <Text
                                                                size="xs"
                                                                c="dimmed"
                                                            >
                                                                {employee.phone
                                                                    .length > 0
                                                                    ? employee.phone
                                                                    : 'No phone added'}
                                                            </Text>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Badge
                                                                variant="outline"
                                                                color="gray"
                                                            >
                                                                {
                                                                    employee.branch_name
                                                                }
                                                            </Badge>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Badge
                                                                variant="light"
                                                                color="gray"
                                                            >
                                                                {
                                                                    employee.department_name
                                                                }
                                                            </Badge>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Text
                                                                size="sm"
                                                                c="dimmed"
                                                            >
                                                                {formatDate(
                                                                    employee.created_at,
                                                                )}
                                                            </Text>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Button
                                                                variant="subtle"
                                                                size="xs"
                                                                aria-label={`Edit ${employee.name}`}
                                                                onClick={() => {
                                                                    setNotice(
                                                                        '',
                                                                    );
                                                                    setForm({
                                                                        employee,
                                                                    });
                                                                }}
                                                            >
                                                                Edit
                                                            </Button>
                                                        </Table.Td>
                                                    </Table.Tr>
                                                ),
                                            )}
                                        </Table.Tbody>
                                    </Table>
                                </Table.ScrollContainer>
                                <Group justify="space-between">
                                    <Text size="sm" c="dimmed">
                                        Showing {firstEmployeeIndex + 1}–
                                        {Math.min(
                                            currentPage * pageSize,
                                            employees.length,
                                        )}{' '}
                                        of {employees.length} employees
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
                <EmployeeForm
                    employee={form.employee}
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
