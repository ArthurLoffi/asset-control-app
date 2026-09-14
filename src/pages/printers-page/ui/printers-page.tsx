import {
    Alert,
    Badge,
    Button,
    Container,
    Group,
    Pagination,
    Paper,
    Stack,
    Table,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import {IconPrinter, IconRefresh, IconSearch} from '@tabler/icons-react';
import type {ReactElement} from 'react';
import {usePrintersPage} from '../model/use-printers-page';
import {PrinterRow} from './printer-row';
import {PrinterForm} from '@/features';
import {ResourcePageHeader, ResourceResults} from '@/shared';

export function PrintersPage(): ReactElement {
    const model = usePrintersPage();

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                <ResourcePageHeader
                    title="Printers"
                    description="Manage printers, network addresses, and locations."
                    icon={<IconPrinter size={26} />}
                    newLabel="New printer"
                    onCreate={() => {
                        model.openForm();
                    }}
                />
                {model.notice.length > 0 && (
                    <Alert color="green" title="Success" role="status">
                        {model.notice}
                    </Alert>
                )}
                {(model.organizationError?.length ?? 0) > 0 && (
                    <Alert
                        color="yellow"
                        title="Location names unavailable"
                        role="alert"
                    >
                        {model.organizationError} Branch and department IDs are
                        shown instead.
                    </Alert>
                )}
                <Paper withBorder p="lg">
                    <Stack gap="lg">
                        <Group justify="space-between">
                            <Group gap="sm">
                                <Title order={2} size="h4">
                                    Printer inventory
                                </Title>
                                {!model.loading &&
                                    (model.error?.length ?? 0) === 0 && (
                                        <Badge variant="light">
                                            {model.printers.length}{' '}
                                            {model.search.kind === 'all'
                                                ? 'total'
                                                : 'found'}
                                        </Badge>
                                    )}
                            </Group>
                            <Button
                                variant="subtle"
                                size="xs"
                                leftSection={<IconRefresh size={16} />}
                                disabled={model.loading}
                                onClick={model.reload}
                            >
                                Refresh
                            </Button>
                        </Group>
                        <form onSubmit={model.handleSearch}>
                            <Group align="flex-end">
                                <TextInput
                                    label="Printer ID"
                                    placeholder="Enter a positive ID"
                                    leftSection={<IconSearch size={16} />}
                                    value={model.query}
                                    onChange={(event) => {
                                        model.setQuery(
                                            event.currentTarget.value,
                                        );
                                    }}
                                    error={
                                        model.searchError.length > 0
                                            ? model.searchError
                                            : undefined
                                    }
                                    style={{flex: 1, minWidth: 180}}
                                />
                                <Button type="submit">Search</Button>
                                {(model.search.kind !== 'all' ||
                                    model.query.length > 0) && (
                                    <Button
                                        variant="default"
                                        onClick={model.resetSearch}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </Group>
                        </form>
                        <ResourceResults
                            loading={model.loading}
                            error={model.error}
                            loadingLabel="Loading printers…"
                            errorTitle="Unable to load printers"
                            onRetry={model.reload}
                            empty={model.printers.length === 0}
                            emptyTitle={
                                model.search.kind === 'all'
                                    ? 'No printers yet'
                                    : 'No printer found'
                            }
                            emptyDescription={
                                model.search.kind === 'all'
                                    ? 'Add your first printer to start the inventory.'
                                    : 'Check the printer ID and try again.'
                            }
                            emptyAction={
                                <Button
                                    variant="light"
                                    onClick={
                                        model.search.kind === 'all'
                                            ? () => {
                                                  model.openForm();
                                              }
                                            : model.resetSearch
                                    }
                                >
                                    {model.search.kind === 'all'
                                        ? 'New printer'
                                        : 'Show all printers'}
                                </Button>
                            }
                        >
                            <Table.ScrollContainer minWidth={1000}>
                                <Table
                                    verticalSpacing="md"
                                    highlightOnHover
                                    aria-label="Printer inventory"
                                >
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Printer</Table.Th>
                                            <Table.Th>Asset number</Table.Th>
                                            <Table.Th>IP address</Table.Th>
                                            <Table.Th>Branch</Table.Th>
                                            <Table.Th>Department</Table.Th>
                                            <Table.Th>Condition</Table.Th>
                                            <Table.Th>Added</Table.Th>
                                            <Table.Th>Actions</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {model.visiblePrinters.map(
                                            (printer) => (
                                                <PrinterRow
                                                    key={printer.id}
                                                    printer={printer}
                                                    branchName={model.branchNames.get(
                                                        printer.branch_id,
                                                    )}
                                                    departmentName={model.departmentNames.get(
                                                        printer.departments_id,
                                                    )}
                                                    onEdit={model.openForm}
                                                />
                                            ),
                                        )}
                                    </Table.Tbody>
                                </Table>
                            </Table.ScrollContainer>
                            <Group justify="space-between">
                                <Text size="sm" c="dimmed">
                                    Showing {model.firstIndex + 1}–
                                    {model.lastIndex} of {model.printers.length}{' '}
                                    printers
                                </Text>
                                {model.totalPages > 1 && (
                                    <Pagination
                                        total={model.totalPages}
                                        value={model.currentPage}
                                        onChange={model.setPage}
                                        size="sm"
                                    />
                                )}
                            </Group>
                        </ResourceResults>
                    </Stack>
                </Paper>
            </Stack>
            {model.form && (
                <PrinterForm
                    printer={model.form.printer}
                    onClose={model.closeForm}
                    onSaved={model.onSaved}
                />
            )}
        </Container>
    );
}
