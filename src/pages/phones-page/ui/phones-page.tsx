import {
    useCallback,
    useMemo,
    useState,
    type ReactElement,
    type SubmitEvent,
} from 'react';
import {useTranslation} from 'react-i18next';
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
    translateMessage,
    i18n,
    translateInventoryValue,
    SortableTableHeader,
    sortableTimestamp,
    useTableSort,
} from '@/shared';
import {usePhones, type Phone, type PhoneSearch} from '@/entities';
import {PhoneForm} from '@/features';
import {EmployeePhoneOverview, useEmployeeDirectory} from '@/widgets';

const pageSize = 10;
const allEmployeesSearch = {kind: 'all'} as const;
type PhoneSortKey =
    'phone' | 'identification' | 'employee' | 'sim' | 'situation' | 'added';

function formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) || date.getUTCFullYear() < 1900
        ? '—'
        : date.toLocaleDateString(i18n.language);
}

function PhoneRow({
    phone,
    employeeName,
    onEdit,
}: {
    phone: Phone;
    employeeName?: string;
    onEdit: (phone: Phone) => void;
}): ReactElement {
    const {t} = useTranslation();
    return (
        <Table.Tr>
            <Table.Td>
                <Text size="sm" fw={500}>
                    {phone.model === '' ? '—' : phone.model}
                </Text>
                <Text size="xs" c="dimmed">
                    {translateInventoryValue(phone.equipament, t) ??
                        t('common.labels.notSpecified')}{' '}
                    · ID #{phone.id}
                </Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm">
                    {phone.serial_number === '' ? '—' : phone.serial_number}
                </Text>
                <Text size="xs" c="dimmed">
                    {phone.imei === ''
                        ? t('common.labels.noImei')
                        : `${t('common.fields.imei')}: ${phone.imei}`}
                </Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm">
                    {phone.employee_id === null
                        ? t('common.labels.unassigned')
                        : (employeeName ?? t('common.labels.noEmployee'))}
                </Text>
            </Table.Td>
            <Table.Td>
                <Badge variant="outline" color="gray">
                    {phone.has_chip === null
                        ? t('common.labels.notSpecified')
                        : t(
                              phone.has_chip
                                  ? 'common.values.included'
                                  : 'common.labels.notIncluded',
                          )}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Badge variant="light">
                    {translateInventoryValue(phone.situation, t) ??
                        phone.situation}
                </Badge>
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
                    aria-label={t('editRecord', {record: phone.model})}
                    onClick={() => {
                        onEdit(phone);
                    }}
                >
                    {t('common.actions.edit')}
                </Button>
            </Table.Td>
        </Table.Tr>
    );
}

export function PhonesPage(): ReactElement {
    const {t} = useTranslation();
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
    } = useEmployeeDirectory(allEmployeesSearch);
    const employeeNames = useMemo(
        () => new Map(employees.map(({id, name}) => [id, name])),
        [employees],
    );
    const getSortValue = useCallback(
        (phone: Phone, key: PhoneSortKey) => {
            switch (key) {
                case 'phone': {
                    return phone.model.length > 0
                        ? phone.model
                        : translateInventoryValue(phone.equipament, t);
                }

                case 'identification': {
                    return phone.serial_number.length > 0
                        ? phone.serial_number
                        : phone.imei;
                }

                case 'employee': {
                    return phone.employee_id === null
                        ? ''
                        : employeeNames.get(phone.employee_id);
                }

                case 'sim': {
                    return phone.has_chip ?? undefined;
                }

                case 'situation': {
                    return (
                        translateInventoryValue(phone.situation, t) ?? undefined
                    );
                }

                case 'added': {
                    return sortableTimestamp(phone.created_at);
                }
            }
        },
        [employeeNames, t],
    );
    const {sort, sortedRecords, toggleSort} = useTableSort(
        phones,
        getSortValue,
        i18n.language,
    );
    const totalPages = Math.max(1, Math.ceil(phones.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const firstPhoneIndex = (currentPage - 1) * pageSize;
    const visiblePhones = sortedRecords.slice(
        firstPhoneIndex,
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

    function handleSort(key: PhoneSortKey): void {
        toggleSort(key);
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
                                {t('resources.phones.title')}
                            </Title>
                            <Text c="dimmed" size="sm">
                                {t('resources.phones.description')}
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
                        {t('resources.phones.new')}
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
                        {translateMessage(notice, t)}
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
                        <Tabs.Tab value="employees">
                            {t('resources.phones.overview')}
                        </Tabs.Tab>
                        <Tabs.Tab value="inventory">
                            {t('resources.phones.inventory')}
                        </Tabs.Tab>
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
                                            {t('resources.phones.inventory')}
                                        </Title>
                                        {!loading && error.length === 0 && (
                                            <Badge variant="light">
                                                {phones.length}{' '}
                                                {t(
                                                    search.kind === 'all'
                                                        ? 'common.labels.total'
                                                        : 'common.labels.found',
                                                    {count: phones.length},
                                                )}
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
                                        {t('common.actions.refresh')}
                                    </Button>
                                </Group>

                                <form onSubmit={handleSearch}>
                                    <Stack gap="xs">
                                        <Group align="flex-end">
                                            <Select
                                                label={t('searchBy')}
                                                w={180}
                                                value={searchKind}
                                                allowDeselect={false}
                                                data={[
                                                    {
                                                        value: 'id',
                                                        label: t('phoneId'),
                                                    },
                                                    {
                                                        value: 'employee_name',
                                                        label: t(
                                                            'common.fields.employeeName',
                                                        ),
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
                                                label={t(
                                                    searchKind === 'id'
                                                        ? 'phoneId'
                                                        : 'common.fields.employeeName',
                                                )}
                                                placeholder={t(
                                                    searchKind === 'id'
                                                        ? 'enterPositiveId'
                                                        : 'enterEmployeeName',
                                                )}
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
                                                {t('common.actions.search')}
                                            </Button>
                                            {(search.kind !== 'all' ||
                                                query.length > 0) && (
                                                <Button
                                                    variant="default"
                                                    onClick={resetSearch}
                                                >
                                                    {t('common.actions.clear')}
                                                </Button>
                                            )}
                                        </Group>
                                        {searchError.length > 0 && (
                                            <Text
                                                c="red"
                                                size="sm"
                                                role="alert"
                                            >
                                                {translateMessage(
                                                    searchError,
                                                    t,
                                                )}
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
                                                {t('resources.phones.loading')}
                                            </Text>
                                        </Stack>
                                    </Center>
                                ) : error.length > 0 ? (
                                    <Alert
                                        color="red"
                                        title={t(
                                            'resources.phones.unavailable',
                                        )}
                                        role="alert"
                                    >
                                        <Stack gap="sm">
                                            <Text size="sm">
                                                {translateMessage(error, t)}
                                            </Text>
                                            <Button
                                                variant="light"
                                                color="red"
                                                size="xs"
                                                onClick={reload}
                                                style={{
                                                    alignSelf: 'flex-start',
                                                }}
                                            >
                                                {t('common.actions.retry')}
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
                                            {t(
                                                search.kind === 'all'
                                                    ? 'resources.phones.empty'
                                                    : 'resources.phones.notFound',
                                            )}
                                        </Title>
                                        <Text c="dimmed" size="sm" ta="center">
                                            {t(
                                                search.kind === 'all'
                                                    ? 'resources.phones.emptyDescription'
                                                    : 'resources.phones.notFoundDescription',
                                            )}
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
                                                ? t('resources.phones.new')
                                                : t('common.messages.showAll', {
                                                      resource:
                                                          t('phonesLower'),
                                                  })}
                                        </Button>
                                    </Stack>
                                ) : (
                                    <>
                                        <Table.ScrollContainer minWidth={950}>
                                            <Table
                                                verticalSpacing="md"
                                                highlightOnHover
                                                aria-label={t(
                                                    'resources.phones.results',
                                                )}
                                            >
                                                <Table.Thead>
                                                    <Table.Tr>
                                                        {(
                                                            [
                                                                [
                                                                    'phone',
                                                                    t('phone'),
                                                                ],
                                                                [
                                                                    'identification',
                                                                    t(
                                                                        'common.fields.identification',
                                                                    ),
                                                                ],
                                                                [
                                                                    'employee',
                                                                    t(
                                                                        'common.fields.employee',
                                                                    ),
                                                                ],
                                                                [
                                                                    'sim',
                                                                    t(
                                                                        'simCard',
                                                                    ),
                                                                ],
                                                                [
                                                                    'situation',
                                                                    t(
                                                                        'common.fields.situation',
                                                                    ),
                                                                ],
                                                                [
                                                                    'added',
                                                                    t(
                                                                        'common.fields.added',
                                                                    ),
                                                                ],
                                                            ] as Array<
                                                                [
                                                                    PhoneSortKey,
                                                                    string,
                                                                ]
                                                            >
                                                        ).map(
                                                            ([
                                                                column,
                                                                label,
                                                            ]) => (
                                                                <SortableTableHeader
                                                                    key={column}
                                                                    column={
                                                                        column
                                                                    }
                                                                    label={
                                                                        label
                                                                    }
                                                                    sort={sort}
                                                                    onSort={
                                                                        handleSort
                                                                    }
                                                                />
                                                            ),
                                                        )}
                                                        <Table.Th>
                                                            {t(
                                                                'common.fields.actions',
                                                            )}
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
                                                {t('common.pagination', {
                                                    from: firstPhoneIndex + 1,
                                                    to: Math.min(
                                                        currentPage * pageSize,
                                                        phones.length,
                                                    ),
                                                    count: phones.length,
                                                    resource: t('phonesLower'),
                                                })}
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
