import {useMemo, useState, type ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {
    Alert,
    Badge,
    Button,
    Center,
    Group,
    Loader,
    Pagination,
    Paper,
    Select,
    SimpleGrid,
    Stack,
    Table,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import {IconRefresh, IconSearch} from '@tabler/icons-react';
import {
    matchesEmployeeName,
    provisionOptions,
    summarizeEmployeePhones,
} from '../model/employee-phone-overview';
import {translateMessage} from '@/shared';
import {type Employee, type Phone} from '@/entities';

type EmployeePhoneOverviewProps = {
    employees: Employee[];
    phones: Phone[];
    loading: boolean;
    error: string;
    onRefresh: () => void;
    onViewInventory: (employee: Employee) => void;
};
const pageSize = 10;

export function EmployeePhoneOverview({
    employees,
    phones,
    loading,
    error,
    onRefresh,
    onViewInventory,
}: EmployeePhoneOverviewProps): ReactElement {
    const {t} = useTranslation();
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [page, setPage] = useState(1);
    const summaries = useMemo(
        () => summarizeEmployeePhones(employees, phones),
        [employees, phones],
    );
    const filtered = summaries.filter(
        ({employee, provision}) =>
            matchesEmployeeName(employee.name, query) &&
            (category === 'all' || category === provision),
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const firstEmployeeIndex = (currentPage - 1) * pageSize;
    const visible = filtered.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
    );
    const unassignedCount = phones.filter(
        ({employee_id}) => employee_id === null,
    ).length;

    function clearFilters() {
        setQuery('');
        setCategory('all');
        setPage(1);
    }

    return (
        <Stack gap="lg">
            <Group justify="space-between">
                <div>
                    <Title order={2} size="h4">
                        {t('employeeCoverage')}
                    </Title>
                    <Text size="sm" c="dimmed">
                        {t('employeeCoverageDescription')}
                    </Text>
                </div>
                <Button
                    variant="subtle"
                    leftSection={<IconRefresh size={16} />}
                    disabled={loading}
                    onClick={onRefresh}
                >
                    {t('common.actions.refresh')}
                </Button>
            </Group>
            {loading ? (
                <Center py={70}>
                    <Stack align="center">
                        <Loader size="sm" />
                        <Text role="status" size="sm" c="dimmed">
                            {t('loadingEmployeeCoverage')}
                        </Text>
                    </Stack>
                </Center>
            ) : error.length > 0 ? (
                <Alert
                    color="red"
                    title={t('unableToLoadEmployeeCoverage')}
                    role="alert"
                >
                    <Stack gap="sm">
                        <Text size="sm">{translateMessage(error, t)}</Text>
                        <Button
                            variant="light"
                            color="red"
                            onClick={onRefresh}
                            style={{alignSelf: 'flex-start'}}
                        >
                            {t('common.actions.retry')}
                        </Button>
                    </Stack>
                </Alert>
            ) : (
                <>
                    <SimpleGrid cols={{base: 1, sm: 2, lg: 4}}>
                        {provisionOptions.map((option) => (
                            <Paper
                                key={option.value}
                                withBorder
                                p="lg"
                                radius="md"
                                style={{
                                    borderColor:
                                        category === option.value
                                            ? `var(--mantine-color-${option.color}-6)`
                                            : undefined,
                                }}
                            >
                                <Stack gap="xs">
                                    <Badge variant="light" color={option.color}>
                                        {t(`provision.${option.value}.label`)}
                                    </Badge>
                                    <Text size="32px" fw={700}>
                                        {
                                            summaries.filter(
                                                ({provision}) =>
                                                    provision === option.value,
                                            ).length
                                        }
                                    </Text>
                                    <Text size="sm" c="dimmed" mih={42}>
                                        {t(
                                            `provision.${option.value}.description`,
                                        )}
                                    </Text>
                                    <Button
                                        variant={
                                            category === option.value
                                                ? 'filled'
                                                : 'light'
                                        }
                                        color={option.color}
                                        aria-pressed={category === option.value}
                                        aria-label={t('showEmployees', {
                                            category: t(
                                                `provision.${option.value}.label`,
                                            ),
                                        })}
                                        onClick={() => {
                                            setCategory(
                                                category === option.value
                                                    ? 'all'
                                                    : option.value,
                                            );
                                            setPage(1);
                                        }}
                                    >
                                        {t('viewEmployees')}
                                    </Button>
                                </Stack>
                            </Paper>
                        ))}
                    </SimpleGrid>
                    <Paper withBorder p="lg">
                        <Stack gap="lg">
                            <Group justify="space-between">
                                <Group gap="sm">
                                    <Title order={3} size="h4">
                                        {t('employeeAssignments')}
                                    </Title>
                                    <Badge variant="light">
                                        {employees.length} {t('employeesLower')}
                                    </Badge>
                                </Group>
                                <Text size="xs" c="dimmed">
                                    {t('eachEmployeeOnce')}
                                </Text>
                            </Group>
                            <Group align="flex-end">
                                <TextInput
                                    label={t('common.fields.employeeName')}
                                    placeholder={t('searchEmployeeName')}
                                    leftSection={<IconSearch size={16} />}
                                    value={query}
                                    onChange={(event) => {
                                        setQuery(event.currentTarget.value);
                                        setPage(1);
                                    }}
                                    style={{flex: 1, minWidth: 180}}
                                />
                                <Select
                                    label={t('companyEquipment')}
                                    value={category}
                                    allowDeselect={false}
                                    data={[
                                        {
                                            value: 'all',
                                            label: t('allEmployees'),
                                        },
                                        ...provisionOptions.map(({value}) => ({
                                            value,
                                            label: t(
                                                `provision.${value}.label`,
                                            ),
                                        })),
                                    ]}
                                    onChange={(value) => {
                                        setCategory(value ?? 'all');
                                        setPage(1);
                                    }}
                                    w={220}
                                />
                                {(query.length > 0 || category !== 'all') && (
                                    <Button
                                        variant="default"
                                        onClick={clearFilters}
                                    >
                                        {t('clearFilters')}
                                    </Button>
                                )}
                            </Group>
                            <Text size="xs" c="dimmed">
                                {t('employeeCoverageNote')}
                            </Text>
                            {unassignedCount > 0 && (
                                <Text size="sm" c="dimmed">
                                    {t('excludedInventory', {
                                        count: unassignedCount,
                                    })}
                                </Text>
                            )}
                            {filtered.length === 0 ? (
                                <Stack align="center" py={40}>
                                    <Text fw={500}>
                                        {t(
                                            employees.length === 0
                                                ? 'resources.employees.empty'
                                                : 'noEmployeesMatch',
                                        )}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        {t(
                                            employees.length === 0
                                                ? 'addEmployeesForCoverage'
                                                : 'tryAnotherEmployeeFilter',
                                        )}
                                    </Text>
                                    {(query.length > 0 ||
                                        category !== 'all') && (
                                        <Button
                                            variant="light"
                                            onClick={clearFilters}
                                        >
                                            {t('common.messages.showAll', {
                                                resource: t('employeesLower'),
                                            })}
                                        </Button>
                                    )}
                                </Stack>
                            ) : (
                                <>
                                    <Table.ScrollContainer minWidth={850}>
                                        <Table
                                            verticalSpacing="md"
                                            highlightOnHover
                                            aria-label={t(
                                                'employeePhoneAssignments',
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
                                                        {t('organization')}
                                                    </Table.Th>
                                                    <Table.Th>
                                                        {t('companyEquipment')}
                                                    </Table.Th>
                                                    <Table.Th>
                                                        {t('assignedRecords')}
                                                    </Table.Th>
                                                    <Table.Th>
                                                        {t(
                                                            'common.fields.actions',
                                                        )}
                                                    </Table.Th>
                                                </Table.Tr>
                                            </Table.Thead>
                                            <Table.Tbody>
                                                {visible.map(
                                                    ({
                                                        employee,
                                                        phones: assigned,
                                                        provision,
                                                    }) => {
                                                        const option =
                                                            provisionOptions.find(
                                                                ({value}) =>
                                                                    value ===
                                                                    provision,
                                                            ) ??
                                                            provisionOptions[3];
                                                        return (
                                                            <Table.Tr
                                                                key={
                                                                    employee.id
                                                                }
                                                            >
                                                                <Table.Td>
                                                                    <Text
                                                                        fw={500}
                                                                        size="sm"
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
                                                                </Table.Td>
                                                                <Table.Td>
                                                                    <Text size="sm">
                                                                        {employee
                                                                            .branch_name
                                                                            .length >
                                                                        0
                                                                            ? employee.branch_name
                                                                            : '—'}
                                                                    </Text>
                                                                    <Text
                                                                        size="xs"
                                                                        c="dimmed"
                                                                    >
                                                                        {employee
                                                                            .department_name
                                                                            .length >
                                                                        0
                                                                            ? employee.department_name
                                                                            : '—'}
                                                                    </Text>
                                                                </Table.Td>
                                                                <Table.Td>
                                                                    <Badge
                                                                        color={
                                                                            option.color
                                                                        }
                                                                        variant="light"
                                                                    >
                                                                        {t(
                                                                            `provision.${option.value}.label`,
                                                                        )}
                                                                    </Badge>
                                                                </Table.Td>
                                                                <Table.Td>
                                                                    {assigned.length ===
                                                                    0 ? (
                                                                        <Text
                                                                            size="sm"
                                                                            c="dimmed"
                                                                        >
                                                                            {t(
                                                                                'noAssignmentRecorded',
                                                                            )}
                                                                        </Text>
                                                                    ) : (
                                                                        assigned.map(
                                                                            (
                                                                                phone,
                                                                            ) => (
                                                                                <Text
                                                                                    key={
                                                                                        phone.id
                                                                                    }
                                                                                    size="sm"
                                                                                >
                                                                                    {phone.equipament ===
                                                                                    'Só chip'
                                                                                        ? t(
                                                                                              'common.values.simOnly',
                                                                                          )
                                                                                        : phone.equipament ===
                                                                                            'Sem chip'
                                                                                          ? t(
                                                                                                'common.values.noSim',
                                                                                            )
                                                                                          : phone.model}{' '}
                                                                                    ·
                                                                                    #
                                                                                    {
                                                                                        phone.id
                                                                                    }
                                                                                </Text>
                                                                            ),
                                                                        )
                                                                    )}
                                                                </Table.Td>
                                                                <Table.Td>
                                                                    <Button
                                                                        variant="subtle"
                                                                        size="xs"
                                                                        disabled={
                                                                            assigned.length ===
                                                                            0
                                                                        }
                                                                        aria-label={t(
                                                                            'viewEquipmentFor',
                                                                            {
                                                                                name: employee.name,
                                                                            },
                                                                        )}
                                                                        onClick={() => {
                                                                            onViewInventory(
                                                                                employee,
                                                                            );
                                                                        }}
                                                                    >
                                                                        {t(
                                                                            'viewEquipment',
                                                                        )}
                                                                    </Button>
                                                                </Table.Td>
                                                            </Table.Tr>
                                                        );
                                                    },
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
                                                    filtered.length,
                                                ),
                                                count: filtered.length,
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
                </>
            )}
        </Stack>
    );
}
