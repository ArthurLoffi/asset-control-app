import {useMemo, useState} from 'react';
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
} from '../model/employee-phone-overview.js';
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
}: EmployeePhoneOverviewProps) {
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
                        Employee coverage
                    </Title>
                    <Text size="sm" c="dimmed">
                        See who has a company phone and SIM, a SIM only, or no
                        SIM.
                    </Text>
                </div>
                <Button
                    variant="subtle"
                    leftSection={<IconRefresh size={16} />}
                    disabled={loading}
                    onClick={onRefresh}
                >
                    Refresh
                </Button>
            </Group>
            {loading ? (
                <Center py={70}>
                    <Stack align="center">
                        <Loader size="sm" />
                        <Text role="status" size="sm" c="dimmed">
                            Loading employee coverage…
                        </Text>
                    </Stack>
                </Center>
            ) : error.length > 0 ? (
                <Alert
                    color="red"
                    title="Unable to load employee coverage"
                    role="alert"
                >
                    <Stack gap="sm">
                        <Text size="sm">{error}</Text>
                        <Button
                            variant="light"
                            color="red"
                            onClick={onRefresh}
                            style={{alignSelf: 'flex-start'}}
                        >
                            Try again
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
                                        {option.label}
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
                                        {option.description}
                                    </Text>
                                    <Button
                                        variant={
                                            category === option.value
                                                ? 'filled'
                                                : 'light'
                                        }
                                        color={option.color}
                                        aria-pressed={category === option.value}
                                        aria-label={`Show employees: ${option.label}`}
                                        onClick={() => {
                                            setCategory(
                                                category === option.value
                                                    ? 'all'
                                                    : option.value,
                                            );
                                            setPage(1);
                                        }}
                                    >
                                        View employees
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
                                        Employee assignments
                                    </Title>
                                    <Badge variant="light">
                                        {employees.length} employees
                                    </Badge>
                                </Group>
                                <Text size="xs" c="dimmed">
                                    Each employee is counted once.
                                </Text>
                            </Group>
                            <Group align="flex-end">
                                <TextInput
                                    label="Employee name"
                                    placeholder="Search by employee name"
                                    leftSection={<IconSearch size={16} />}
                                    value={query}
                                    onChange={(event) => {
                                        setQuery(event.currentTarget.value);
                                        setPage(1);
                                    }}
                                    style={{flex: 1, minWidth: 180}}
                                />
                                <Select
                                    label="Company equipment"
                                    value={category}
                                    allowDeselect={false}
                                    data={[
                                        {value: 'all', label: 'All employees'},
                                        ...provisionOptions.map(
                                            ({value, label}) => ({
                                                value,
                                                label,
                                            }),
                                        ),
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
                                        Clear filters
                                    </Button>
                                )}
                            </Group>
                            <Text size="xs" c="dimmed">
                                Counts cover all employees. Employees with no
                                assignment or incomplete SIM details are marked
                                “Not recorded”.
                            </Text>
                            {unassignedCount > 0 && (
                                <Text size="sm" c="dimmed">
                                    {unassignedCount} unassigned inventory{' '}
                                    {unassignedCount === 1
                                        ? 'record is'
                                        : 'records are'}{' '}
                                    excluded from employee counts.
                                </Text>
                            )}
                            {filtered.length === 0 ? (
                                <Stack align="center" py={40}>
                                    <Text fw={500}>
                                        {employees.length === 0
                                            ? 'No employees yet'
                                            : 'No employees match these filters'}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        {employees.length === 0
                                            ? 'Add employees to see their company phone and SIM assignments.'
                                            : 'Try another employee name or equipment category.'}
                                    </Text>
                                    {(query.length > 0 ||
                                        category !== 'all') && (
                                        <Button
                                            variant="light"
                                            onClick={clearFilters}
                                        >
                                            Show all employees
                                        </Button>
                                    )}
                                </Stack>
                            ) : (
                                <>
                                    <Table.ScrollContainer minWidth={850}>
                                        <Table
                                            verticalSpacing="md"
                                            highlightOnHover
                                            aria-label="Employee phone and SIM assignments"
                                        >
                                            <Table.Thead>
                                                <Table.Tr>
                                                    <Table.Th>
                                                        Employee
                                                    </Table.Th>
                                                    <Table.Th>
                                                        Organization
                                                    </Table.Th>
                                                    <Table.Th>
                                                        Company equipment
                                                    </Table.Th>
                                                    <Table.Th>
                                                        Assigned records
                                                    </Table.Th>
                                                    <Table.Th>Actions</Table.Th>
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
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </Badge>
                                                                </Table.Td>
                                                                <Table.Td>
                                                                    {assigned.length ===
                                                                    0 ? (
                                                                        <Text
                                                                            size="sm"
                                                                            c="dimmed"
                                                                        >
                                                                            No
                                                                            assignment
                                                                            recorded
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
                                                                                        ? 'SIM card'
                                                                                        : phone.equipament ===
                                                                                            'Sem chip'
                                                                                          ? 'No SIM card'
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
                                                                        aria-label={`View equipment for ${employee.name}`}
                                                                        onClick={() => {
                                                                            onViewInventory(
                                                                                employee,
                                                                            );
                                                                        }}
                                                                    >
                                                                        View
                                                                        equipment
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
                                            Showing {firstEmployeeIndex + 1}–
                                            {Math.min(
                                                currentPage * pageSize,
                                                filtered.length,
                                            )}{' '}
                                            of {filtered.length} employees
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
