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
    Tabs,
    Text,
    TextInput,
    ThemeIcon,
    Title,
} from '@mantine/core';
import {
    IconDeviceMobile,
    IconPlus,
    IconRefresh,
    IconSearch,
} from '@tabler/icons-react';
import {
    useEmployees,
    usePhones,
    phoneEquipmentOptions,
    type Phone,
    type PhoneSearch,
} from '@/entities';
import {PhoneForm} from '@/features';
import {EmployeePhoneOverview} from '@/widgets';

const pageSize = 10;
const allEmployeesSearch = {kind: 'all'} as const;

function formatDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) || date.getUTCFullYear() < 1900
        ? '—'
        : date.toLocaleDateString();
}

function PhoneRow({
    phone,
    employeeName,
    onEdit,
}: {
    phone: Phone;
    employeeName?: string;
    onEdit: (phone: Phone) => void;
}) {
    return (
        <Table.Tr>
            <Table.Td>
                <Text size="sm" fw={500}>
                    {phone.model}
                </Text>
                <Text size="xs" c="dimmed">
                    {phoneEquipmentOptions.find(
                        ({value}) => value === phone.equipament,
                    )?.label ?? 'Equipment not specified'}{' '}
                    · ID #{phone.id}
                </Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm">{phone.serial_number}</Text>
                <Text size="xs" c="dimmed">
                    IMEI: {phone.imei}
                </Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm">
                    {phone.employee_id === null
                        ? 'Unassigned'
                        : (employeeName ?? 'Employee not found')}
                </Text>
            </Table.Td>
            <Table.Td>
                <Badge variant="outline" color="gray">
                    {phone.has_chip === null
                        ? 'Not specified'
                        : phone.has_chip
                          ? 'Included'
                          : 'Not included'}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Badge variant="light">{phone.situation}</Badge>
            </Table.Td>
            <Table.Td>
                <Text size="sm" c="dimmed">
                    {formatDate(phone.created_at)}
                </Text>
            </Table.Td>
            <Table.Td>
                <Button
                    variant="subtle"
                    size="xs"
                    aria-label={`Edit ${phone.model}`}
                    onClick={() => {
                        onEdit(phone);
                    }}
                >
                    Edit
                </Button>
            </Table.Td>
        </Table.Tr>
    );
}

export function PhonesPage() {
    const [view, setView] = useState('employees');
    const [search, setSearch] = useState<PhoneSearch>({kind: 'all'});
    const [searchKind, setSearchKind] = useState<'id' | 'employee_name'>(
        'employee_name',
    );
    const [query, setQuery] = useState('');
    const [searchError, setSearchError] = useState('');
    const [page, setPage] = useState(1);
    const [form, setForm] = useState<{phone?: Phone} | undefined>();
    const [notice, setNotice] = useState('');
    const {phones, loading, error, reload} = usePhones(search);
    const {
        employees,
        loading: employeesLoading,
        error: employeesError,
        reload: reloadEmployees,
    } = useEmployees(allEmployeesSearch);
    const employeeNames = useMemo(
        () => new Map(employees.map(({id, name}) => [id, name])),
        [employees],
    );
    const totalPages = Math.max(1, Math.ceil(phones.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const firstPhoneIndex = (currentPage - 1) * pageSize;
    const visiblePhones = phones.slice(firstPhoneIndex, currentPage * pageSize);

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
                            <IconDeviceMobile size={26} />
                        </ThemeIcon>
                        <div>
                            <Title order={1} size="h2">
                                Phones
                            </Title>
                            <Text c="dimmed" size="sm">
                                Track company phones and SIM cards by employee.
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
                        New phone
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

                <Tabs
                    value={view}
                    onChange={(value) => {
                        setView(value ?? 'employees');
                        if (value !== 'inventory') {
                            resetSearch();
                        }
                    }}
                    keepMounted={false}
                >
                    <Tabs.List mb="lg">
                        <Tabs.Tab value="employees">Employee overview</Tabs.Tab>
                        <Tabs.Tab value="inventory">Phone inventory</Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="employees">
                        <EmployeePhoneOverview
                            employees={employees}
                            phones={phones}
                            loading={loading || employeesLoading}
                            error={[error, employeesError].join(' ').trim()}
                            onRefresh={() => {
                                reload();
                                reloadEmployees();
                            }}
                            onViewInventory={(employee) => {
                                setSearch({
                                    kind: 'employee_id',
                                    value: String(employee.id),
                                });
                                setSearchKind('employee_name');
                                setQuery(employee.name);
                                setSearchError('');
                                setPage(1);
                                setView('inventory');
                            }}
                        />
                    </Tabs.Panel>
                    <Tabs.Panel value="inventory">
                        <Paper withBorder p="lg">
                            <Stack gap="lg">
                                <Group justify="space-between">
                                    <Group gap="sm">
                                        <Title order={2} size="h4">
                                            Phone inventory
                                        </Title>
                                        {!loading && error.length === 0 && (
                                            <Badge variant="light">
                                                {phones.length}{' '}
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
                                                    {
                                                        value: 'id',
                                                        label: 'Phone ID',
                                                    },
                                                    {
                                                        value: 'employee_name',
                                                        label: 'Employee name',
                                                    },
                                                ]}
                                                onChange={(value) => {
                                                    setSearchKind(
                                                        value ===
                                                            'employee_name'
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
                                                        ? 'Phone ID'
                                                        : 'Employee name'
                                                }
                                                placeholder={
                                                    searchKind === 'id'
                                                        ? 'Enter a positive ID'
                                                        : 'Enter an employee name'
                                                }
                                                leftSection={
                                                    <IconSearch size={16} />
                                                }
                                                value={query}
                                                onChange={(event) => {
                                                    setQuery(
                                                        event.currentTarget
                                                            .value,
                                                    );
                                                }}
                                                style={{flex: 1, minWidth: 180}}
                                            />
                                            <Button type="submit">
                                                Search
                                            </Button>
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
                                            <Text
                                                c="red"
                                                size="sm"
                                                role="alert"
                                            >
                                                {searchError}
                                            </Text>
                                        )}
                                    </Stack>
                                </form>

                                {loading ? (
                                    <Center py={70}>
                                        <Stack align="center">
                                            <Loader size="sm" />
                                            <Text
                                                size="sm"
                                                c="dimmed"
                                                role="status"
                                            >
                                                Loading phones…
                                            </Text>
                                        </Stack>
                                    </Center>
                                ) : error.length > 0 ? (
                                    <Alert
                                        color="red"
                                        title="Unable to load phones"
                                        role="alert"
                                    >
                                        <Stack gap="sm">
                                            <Text size="sm">{error}</Text>
                                            <Button
                                                variant="light"
                                                color="red"
                                                size="xs"
                                                onClick={reload}
                                                style={{
                                                    alignSelf: 'flex-start',
                                                }}
                                            >
                                                Try again
                                            </Button>
                                        </Stack>
                                    </Alert>
                                ) : phones.length === 0 ? (
                                    <Stack align="center" py={60} gap="sm">
                                        <ThemeIcon
                                            size={56}
                                            variant="light"
                                            color="gray"
                                            radius="xl"
                                        >
                                            <IconDeviceMobile size={28} />
                                        </ThemeIcon>
                                        <Title order={3} size="h4">
                                            {search.kind === 'all'
                                                ? 'No phones yet'
                                                : 'No phone found'}
                                        </Title>
                                        <Text c="dimmed" size="sm" ta="center">
                                            {search.kind === 'all'
                                                ? 'Add your first phone to start the inventory.'
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
                                                ? 'New phone'
                                                : 'Show all phones'}
                                        </Button>
                                    </Stack>
                                ) : (
                                    <>
                                        <Table.ScrollContainer minWidth={950}>
                                            <Table
                                                verticalSpacing="md"
                                                highlightOnHover
                                                aria-label="Phone inventory"
                                            >
                                                <Table.Thead>
                                                    <Table.Tr>
                                                        <Table.Th>
                                                            Phone
                                                        </Table.Th>
                                                        <Table.Th>
                                                            Identification
                                                        </Table.Th>
                                                        <Table.Th>
                                                            Employee
                                                        </Table.Th>
                                                        <Table.Th>
                                                            SIM card
                                                        </Table.Th>
                                                        <Table.Th>
                                                            Situation
                                                        </Table.Th>
                                                        <Table.Th>
                                                            Added
                                                        </Table.Th>
                                                        <Table.Th>
                                                            Actions
                                                        </Table.Th>
                                                    </Table.Tr>
                                                </Table.Thead>
                                                <Table.Tbody>
                                                    {visiblePhones.map(
                                                        (phone) => (
                                                            <PhoneRow
                                                                key={phone.id}
                                                                phone={phone}
                                                                employeeName={
                                                                    phone.employee_id ===
                                                                    null
                                                                        ? undefined
                                                                        : employeeNames.get(
                                                                              phone.employee_id,
                                                                          )
                                                                }
                                                                onEdit={(
                                                                    selectedPhone,
                                                                ) => {
                                                                    setNotice(
                                                                        '',
                                                                    );
                                                                    setForm({
                                                                        phone: selectedPhone,
                                                                    });
                                                                }}
                                                            />
                                                        ),
                                                    )}
                                                </Table.Tbody>
                                            </Table>
                                        </Table.ScrollContainer>
                                        <Group justify="space-between">
                                            <Text size="sm" c="dimmed">
                                                Showing {firstPhoneIndex + 1}–
                                                {Math.min(
                                                    currentPage * pageSize,
                                                    phones.length,
                                                )}{' '}
                                                of {phones.length} phones
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
                    </Tabs.Panel>
                </Tabs>
            </Stack>
            {form && (
                <PhoneForm
                    phone={form.phone}
                    onClose={() => {
                        setForm(undefined);
                    }}
                    onSaved={(message) => {
                        setForm(undefined);
                        setNotice(message);
                        resetSearch();
                        reload();
                    }}
                />
            )}
        </Container>
    );
}
