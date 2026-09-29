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
    translateMessage,
    i18n,
    translateInventoryValue,
    SortableTableHeader,
    sortableTimestamp,
    useTableSort,
    effectiveValues,
    formatValues,
} from '@/shared';
import {
    useEmployees,
    useMachines,
    type Machine,
    type MachineSearch,
} from '@/entities';
import {MachineForm} from '@/features';

const pageSize = 10;
const allEmployeesSearch = {kind: 'all'} as const;
type MachineSortKey =
    | 'machine'
    | 'identification'
    | 'assignment'
    | 'condition'
    | 'peripherals'
    | 'situation'
    | 'added';

function formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) || date.getUTCFullYear() < 1900
        ? '—'
        : date.toLocaleDateString(i18n.language);
}

function includedLabel(
    value: Machine['has_keyboard'],
    t: (key: string) => string,
) {
    if (value === null) {
        return t('common.labels.unknown');
    }

    return t(value ? 'common.values.included' : 'common.labels.notIncluded');
}

function MachineRow({
    machine,
    employeeName,
    onEdit,
}: {
    machine: Machine;
    employeeName?: string;
    onEdit: (machine: Machine) => void;
}): ReactElement {
    const {t} = useTranslation();
    return (
        <Table.Tr>
            <Table.Td>
                <Text size="sm" fw={500}>
                    {machine.model}
                </Text>
                <Text size="xs" c="dimmed">
                    {translateInventoryValue(machine.type, t)} · ID #
                    {machine.id}
                </Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm">
                    {machine.serial_number === '' ? '—' : machine.serial_number}
                </Text>
                <Text size="xs" c="dimmed">
                    {machine.asset_number === null
                        ? t('common.labels.noAssetNumber')
                        : `${t('common.fields.asset')} #${machine.asset_number}`}
                </Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm">{machine.user}</Text>
                <Text size="xs" c="dimmed">
                    {employeeName === undefined
                        ? t('common.labels.unassigned')
                        : (employeeName ?? t('common.labels.noEmployee'))}
                </Text>
            </Table.Td>
            <Table.Td>
                <Badge variant="outline" color="gray">
                    {translateInventoryValue(machine.machine_condition, t) ??
                        t('common.labels.notSpecified')}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Text size="xs">
                    {t('keyboard')}: {includedLabel(machine.has_keyboard, t)}
                </Text>
                <Text size="xs">
                    {t('mouse')}: {includedLabel(machine.has_mouse, t)}
                </Text>
            </Table.Td>
            <Table.Td>
                <Badge variant="light">
                    {translateInventoryValue(machine.situation, t)}
                </Badge>
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
                    aria-label={t('editRecord', {record: machine.model})}
                    onClick={() => {
                        onEdit(machine);
                    }}
                >
                    {t('common.actions.edit')}
                </Button>
            </Table.Td>
        </Table.Tr>
    );
}

export function MachinesPage(): ReactElement {
    const {t} = useTranslation();
    const [search, setSearch] = useState<MachineSearch>({kind: 'all'});
    const [searchKind, setSearchKind] = useState<
        'id' | 'employee_name' | 'unassigned'
    >('employee_name');
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
    const getSortValue = useCallback(
        (machine: Machine, key: MachineSortKey) => {
            switch (key) {
                case 'machine': {
                    return machine.model;
                }

                case 'identification': {
                    return machine.serial_number !== null &&
                        machine.serial_number.length > 0
                        ? machine.serial_number
                        : (machine.asset_number ?? undefined);
                }

                case 'assignment': {
                    return machine.user.length > 0
                        ? machine.user
                        : effectiveValues(
                              machine.employee_id,
                              machine.employee_ids,
                          )
                              .map((id) => employeeNames.get(id) ?? `#${id}`)
                              .join(', ');
                }

                case 'condition': {
                    return (
                        translateInventoryValue(machine.machine_condition, t) ??
                        undefined
                    );
                }

                case 'peripherals': {
                    return `${String(machine.has_keyboard)}-${String(machine.has_mouse)}`;
                }

                case 'situation': {
                    return (
                        translateInventoryValue(machine.situation, t) ??
                        undefined
                    );
                }

                case 'added': {
                    return sortableTimestamp(machine.created_at);
                }
            }
        },
        [employeeNames, t],
    );
    const {sort, sortedRecords, toggleSort} = useTableSort(
        machines,
        getSortValue,
        i18n.language,
    );
    const totalPages = Math.max(1, Math.ceil(machines.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const firstMachineIndex = (currentPage - 1) * pageSize;
    const visibleMachines = sortedRecords.slice(
        firstMachineIndex,
        currentPage * pageSize,
    );

    function resetSearch(): void {
        if (searchKind === 'unassigned') {
            setSearchKind('employee_name');
        }

        setQuery('');
        setSearchError('');
        setSearch({kind: 'all'});
        setPage(1);
    }

    function handleSearch(event: SubmitEvent<HTMLFormElement>): void {
        event.preventDefault();
        if (searchKind === 'unassigned') {
            setSearchError('');
            setSearch({kind: 'unassigned'});
            setPage(1);
            return;
        }

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

    function handleSort(key: MachineSortKey): void {
        toggleSort(key);
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
                                {t('resources.machines.title')}
                            </Title>
                            <Text c="dimmed" size="sm">
                                {t('resources.machines.description')}
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
                        {t('resources.machines.new')}
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

                <Paper withBorder p="lg">
                    <Stack gap="lg">
                        <Group justify="space-between">
                            <Group gap="sm">
                                <Title order={2} size="h4">
                                    {t('resources.machines.inventory')}
                                </Title>
                                {!loading && error.length === 0 && (
                                    <Badge variant="light">
                                        {machines.length}{' '}
                                        {t(
                                            search.kind === 'all'
                                                ? 'common.labels.total'
                                                : 'common.labels.found',
                                            {count: machines.length},
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
                                                label: t('machineId'),
                                            },
                                            {
                                                value: 'employee_name',
                                                label: t(
                                                    'common.fields.employeeName',
                                                ),
                                            },
                                            {
                                                value: 'unassigned',
                                                label: t('unassignedMachines'),
                                            },
                                        ]}
                                        onChange={(value) => {
                                            setSearchKind(
                                                value === 'employee_name'
                                                    ? 'employee_name'
                                                    : value === 'unassigned'
                                                      ? 'unassigned'
                                                      : 'id',
                                            );
                                            setQuery('');
                                            setSearchError('');
                                        }}
                                    />
                                    {searchKind !== 'unassigned' && (
                                        <TextInput
                                            label={t(
                                                searchKind === 'id'
                                                    ? 'machineId'
                                                    : 'common.fields.employeeName',
                                            )}
                                            placeholder={t(
                                                searchKind === 'id'
                                                    ? 'enterMachineId'
                                                    : 'enterEmployeeName',
                                            )}
                                            leftSection={
                                                <IconSearch size={16} />
                                            }
                                            value={query}
                                            onChange={(event) => {
                                                setQuery(
                                                    event.currentTarget.value,
                                                );
                                            }}
                                            style={{flex: 1, minWidth: 180}}
                                        />
                                    )}
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
                                    <Text c="red" size="sm" role="alert">
                                        {translateMessage(searchError, t)}
                                    </Text>
                                )}
                            </Stack>
                        </form>

                        {loading ? (
                            <Center py={70}>
                                <Stack align="center">
                                    <Loader size="sm" />
                                    <Text size="sm" c="dimmed" role="status">
                                        {t('resources.machines.loading')}
                                    </Text>
                                </Stack>
                            </Center>
                        ) : error.length > 0 ? (
                            <Alert
                                color="red"
                                title={t('resources.machines.unavailable')}
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
                                        style={{alignSelf: 'flex-start'}}
                                    >
                                        {t('common.actions.retry')}
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
                                    {t(
                                        search.kind === 'all'
                                            ? 'resources.machines.empty'
                                            : 'resources.machines.notFound',
                                    )}
                                </Title>
                                <Text c="dimmed" size="sm" ta="center">
                                    {t(
                                        search.kind === 'all'
                                            ? 'resources.machines.emptyDescription'
                                            : 'resources.machines.notFoundDescription',
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
                                        ? t('resources.machines.new')
                                        : t('common.messages.showAll', {
                                              resource: t('machinesLower'),
                                          })}
                                </Button>
                            </Stack>
                        ) : (
                            <>
                                <Table.ScrollContainer minWidth={1100}>
                                    <Table
                                        verticalSpacing="md"
                                        highlightOnHover
                                        aria-label={t(
                                            'resources.machines.results',
                                        )}
                                    >
                                        <Table.Thead>
                                            <Table.Tr>
                                                {(
                                                    [
                                                        [
                                                            'machine',
                                                            t('machine'),
                                                        ],
                                                        [
                                                            'identification',
                                                            t(
                                                                'common.fields.identification',
                                                            ),
                                                        ],
                                                        [
                                                            'assignment',
                                                            t('assignment'),
                                                        ],
                                                        [
                                                            'condition',
                                                            t(
                                                                'common.fields.condition',
                                                            ),
                                                        ],
                                                        [
                                                            'peripherals',
                                                            t('peripherals'),
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
                                                        [MachineSortKey, string]
                                                    >
                                                ).map(([column, label]) => (
                                                    <SortableTableHeader
                                                        key={column}
                                                        column={column}
                                                        label={label}
                                                        sort={sort}
                                                        onSort={handleSort}
                                                    />
                                                ))}
                                                <Table.Th>
                                                    {t('common.fields.actions')}
                                                </Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {visibleMachines.map((machine) => (
                                                <MachineRow
                                                    key={machine.id}
                                                    machine={machine}
                                                    employeeName={formatValues(
                                                        machine.employee_id,
                                                        machine.employee_ids,
                                                        (id) =>
                                                            employeeNames.get(
                                                                id,
                                                            ) ?? `#${id}`,
                                                    )}
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
                                        {t('common.pagination', {
                                            from: firstMachineIndex + 1,
                                            to: Math.min(
                                                currentPage * pageSize,
                                                machines.length,
                                            ),
                                            count: machines.length,
                                            resource: t('machinesLower'),
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
