import {useState, type ReactElement, type SubmitEvent} from 'react';
import {useTranslation} from 'react-i18next';
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
import {translateMessage, i18n} from '@/shared';
import {type Employee, type EmployeeSearch} from '@/entities';
import {EmployeeForm} from '@/features';
import {useEmployeeDirectory} from '@/widgets';

const pageSize = 10;

function formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) || date.getUTCFullYear() < 1900
        ? '—'
        : date.toLocaleDateString(i18n.language);
}

export function EmployeesPage(): ReactElement {
    const {t} = useTranslation();
    const [search, setSearch] = useState<EmployeeSearch>({kind: 'all'});
    const [searchKind, setSearchKind] = useState('name');
    const [query, setQuery] = useState('');
    const [searchError, setSearchError] = useState('');
    const [page, setPage] = useState(1);
    const [form, setForm] = useState<{employee?: Employee} | undefined>();
    const [notice, setNotice] = useState('');
    const {employees, loading, error, reload} = useEmployeeDirectory(search);
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
                                {t('resources.employees.title')}
                            </Title>
                            <Text c="dimmed" size="sm">
                                {t('resources.employees.description')}
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
                        {t('resources.employees.new')}
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
                                    {t('resources.employees.inventory')}
                                </Title>
                                {!loading && error.length === 0 && (
                                    <Badge variant="light">
                                        {employees.length}{' '}
                                        {t(
                                            search.kind === 'all'
                                                ? 'common.labels.total'
                                                : 'common.labels.found',
                                            {count: employees.length},
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
                                        w={160}
                                        value={searchKind}
                                        allowDeselect={false}
                                        data={[
                                            {
                                                value: 'name',
                                                label: t('name'),
                                            },
                                            {
                                                value: 'id',
                                                label: t(
                                                    'common.fields.employeeId',
                                                ),
                                            },
                                        ]}
                                        onChange={(value) => {
                                            setSearchKind(value ?? 'name');
                                            setSearchError('');
                                        }}
                                    />
                                    <TextInput
                                        label={t(
                                            searchKind === 'id'
                                                ? 'common.fields.employeeId'
                                                : 'common.fields.employeeName',
                                        )}
                                        placeholder={t(
                                            searchKind === 'id'
                                                ? 'enterEmployeeId'
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
                                        {t('resources.employees.loading')}
                                    </Text>
                                </Stack>
                            </Center>
                        ) : error.length > 0 ? (
                            <Alert
                                color="red"
                                title={t('resources.employees.unavailable')}
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
                                    {t(
                                        search.kind === 'all'
                                            ? 'resources.employees.empty'
                                            : 'resources.employees.notFound',
                                    )}
                                </Title>
                                <Text c="dimmed" size="sm" ta="center">
                                    {t(
                                        search.kind === 'all'
                                            ? 'resources.employees.emptyDescription'
                                            : 'resources.employees.notFoundDescription',
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
                                        ? t('resources.employees.new')
                                        : t('common.messages.showAll', {
                                              resource: t('employeesLower'),
                                          })}
                                </Button>
                            </Stack>
                        ) : (
                            <>
                                <Table.ScrollContainer minWidth={820}>
                                    <Table
                                        verticalSpacing="md"
                                        highlightOnHover
                                        aria-label={t(
                                            'resources.employees.results',
                                        )}
                                    >
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>
                                                    {t(
                                                        'common.fields.employee',
                                                    )}
                                                </Table.Th>
                                                <Table.Th>
                                                    {t('contact')}
                                                </Table.Th>
                                                <Table.Th>
                                                    {t('common.fields.branch')}
                                                </Table.Th>
                                                <Table.Th>
                                                    {t(
                                                        'common.fields.department',
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
                                                                    : t(
                                                                          'noPhoneAdded',
                                                                      )}
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
                                                                aria-label={t(
                                                                    'editRecord',
                                                                    {
                                                                        record: employee.name,
                                                                    },
                                                                )}
                                                                onClick={() => {
                                                                    setNotice(
                                                                        '',
                                                                    );
                                                                    setForm({
                                                                        employee,
                                                                    });
                                                                }}
                                                            >
                                                                {t(
                                                                    'common.actions.edit',
                                                                )}
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
                                        {t('common.pagination', {
                                            from: firstEmployeeIndex + 1,
                                            to: Math.min(
                                                currentPage * pageSize,
                                                employees.length,
                                            ),
                                            count: employees.length,
                                            resource: t('employeesLower'),
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
