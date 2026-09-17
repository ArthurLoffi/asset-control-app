import {useMemo, useState, type ReactElement, type SubmitEvent} from 'react';
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
    IconDeviceDesktop,
    IconPlus,
    IconRefresh,
    IconSearch,
} from '@tabler/icons-react';
import {translateMessage, i18n, translateInventoryValue} from '@/shared';
import {
    useEmployees,
    useMonitors,
    type Monitor,
    type MonitorSearch,
} from '@/entities';
import {MonitorForm} from '@/features';

const pageSize = 10;
const allEmployeesSearch = {kind: 'all'} as const;

function formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) || date.getUTCFullYear() < 1900
        ? '—'
        : date.toLocaleDateString(i18n.language);
}

function MonitorRow({
    monitor,
    employeeName,
    onEdit,
}: {
    monitor: Monitor;
    employeeName?: string;
    onEdit: (monitor: Monitor) => void;
}): ReactElement {
    const {t} = useTranslation();
    return (
        <Table.Tr>
            <Table.Td>
                <Text size="sm" fw={500}>
                    {monitor.model}
                </Text>
                <Text size="xs" c="dimmed">
                    {monitor.brand ?? t('brandNotSpecified')} · ID #{monitor.id}
                </Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm">{monitor.serial_number ?? '—'}</Text>
                <Text size="xs" c="dimmed">
                    {monitor.asset_number === null
                        ? t('common.labels.noAssetNumber')
                        : `${t('common.fields.asset')} #${monitor.asset_number}`}
                </Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm">
                    {monitor.employee_id === null
                        ? t('common.labels.unassigned')
                        : (employeeName ?? t('common.labels.noEmployee'))}
                </Text>
            </Table.Td>
            <Table.Td>
                <Badge variant="outline" color="gray">
                    {translateInventoryValue(monitor.monitor_condition, t) ??
                        t('common.labels.notSpecified')}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Badge variant="light">
                    {translateInventoryValue(monitor.situation, t)}
                </Badge>
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
                    aria-label={t('editRecord', {record: monitor.model})}
                    onClick={() => {
                        onEdit(monitor);
                    }}
                >
                    {t('common.actions.edit')}
                </Button>
            </Table.Td>
        </Table.Tr>
    );
}

export function MonitorsPage(): ReactElement {
    const {t} = useTranslation();
    const [search, setSearch] = useState<MonitorSearch>({kind: 'all'});
    const [searchKind, setSearchKind] = useState<'id' | 'employee_name'>(
        'employee_name',
    );
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
                                {t('resources.monitors.title')}
                            </Title>
                            <Text c="dimmed" size="sm">
                                {t('resources.monitors.description')}
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
                        {t('resources.monitors.new')}
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
                                    {t('resources.monitors.inventory')}
                                </Title>
                                {!loading && error.length === 0 && (
                                    <Badge variant="light">
                                        {monitors.length}{' '}
                                        {t(
                                            search.kind === 'all'
                                                ? 'common.labels.total'
                                                : 'common.labels.found',
                                            {count: monitors.length},
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
                                                label: t('monitorId'),
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
                                                value === 'employee_name'
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
                                                ? 'monitorId'
                                                : 'common.fields.employeeName',
                                        )}
                                        placeholder={t(
                                            searchKind === 'id'
                                                ? 'enterPositiveId'
                                                : 'enterEmployeeName',
                                        )}
                                        leftSection={<IconSearch size={16} />}
                                        value={query}
                                        onChange={(event) => {
                                            setQuery(event.currentTarget.value);
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
                                        {t('resources.monitors.loading')}
                                    </Text>
                                </Stack>
                            </Center>
                        ) : error.length > 0 ? (
                            <Alert
                                color="red"
                                title={t('resources.monitors.unavailable')}
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
                                    {t(
                                        search.kind === 'all'
                                            ? 'resources.monitors.empty'
                                            : 'resources.monitors.notFound',
                                    )}
                                </Title>
                                <Text c="dimmed" size="sm" ta="center">
                                    {t(
                                        search.kind === 'all'
                                            ? 'resources.monitors.emptyDescription'
                                            : 'resources.monitors.notFoundDescription',
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
                                        ? t('resources.monitors.new')
                                        : t('common.messages.showAll', {
                                              resource: t('monitorsLower'),
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
                                            'resources.monitors.results',
                                        )}
                                    >
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>
                                                    {t('monitor')}
                                                </Table.Th>
                                                <Table.Th>
                                                    {t(
                                                        'common.fields.identification',
                                                    )}
                                                </Table.Th>
                                                <Table.Th>
                                                    {t(
                                                        'common.fields.employee',
                                                    )}
                                                </Table.Th>
                                                <Table.Th>
                                                    {t(
                                                        'common.fields.condition',
                                                    )}
                                                </Table.Th>
                                                <Table.Th>
                                                    {t(
                                                        'common.fields.situation',
                                                    )}
                                                </Table.Th>
                                                <Table.Th>
                                                    {t('common.fields.added')}
                                                </Table.Th>
                                                <Table.Th>
                                                    {t('common.fields.actions')}
                                                </Table.Th>
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
                                        {t('common.pagination', {
                                            from: firstMonitorIndex + 1,
                                            to: Math.min(
                                                currentPage * pageSize,
                                                monitors.length,
                                            ),
                                            count: monitors.length,
                                            resource: t('monitorsLower'),
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
