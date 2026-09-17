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
import {useTranslation} from 'react-i18next';
import {usePrintersPage} from '../model/use-printers-page';
import {PrinterRow} from './printer-row';
import {translateMessage, ResourcePageHeader, ResourceResults} from '@/shared';
import {PrinterForm} from '@/features';

export function PrintersPage(): ReactElement {
    const {t} = useTranslation();
    const model = usePrintersPage();

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                <ResourcePageHeader
                    title={t('resources.printers.title')}
                    description={t('resources.printers.description')}
                    icon={<IconPrinter size={26} />}
                    newLabel={t('resources.printers.new')}
                    onCreate={() => {
                        model.openForm();
                    }}
                />
                {model.notice.length > 0 && (
                    <Alert color="green" title={t('success')} role="status">
                        {translateMessage(model.notice, t)}
                    </Alert>
                )}
                {(model.organizationError?.length ?? 0) > 0 && (
                    <Alert
                        color="yellow"
                        title={t('locationNamesUnavailable')}
                        role="alert"
                    >
                        {t('locationIdsFallback', {
                            error: translateMessage(model.organizationError, t),
                        })}
                    </Alert>
                )}
                <Paper withBorder p="lg">
                    <Stack gap="lg">
                        <Group justify="space-between">
                            <Group gap="sm">
                                <Title order={2} size="h4">
                                    {t('resources.printers.inventory')}
                                </Title>
                                {!model.loading &&
                                    (model.error?.length ?? 0) === 0 && (
                                        <Badge variant="light">
                                            {model.printers.length}{' '}
                                            {t(
                                                model.search.kind === 'all'
                                                    ? 'common.labels.total'
                                                    : 'common.labels.found',
                                                {count: model.printers.length},
                                            )}
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
                                {t('common.actions.refresh')}
                            </Button>
                        </Group>
                        <form onSubmit={model.handleSearch}>
                            <Group align="flex-end">
                                <TextInput
                                    label={t('printerId')}
                                    placeholder={t('enterPositiveId')}
                                    leftSection={<IconSearch size={16} />}
                                    value={model.query}
                                    onChange={(event) => {
                                        model.setQuery(
                                            event.currentTarget.value,
                                        );
                                    }}
                                    error={
                                        model.searchError.length > 0
                                            ? translateMessage(
                                                  model.searchError,
                                                  t,
                                              )
                                            : undefined
                                    }
                                    style={{flex: 1, minWidth: 180}}
                                />
                                <Button type="submit">
                                    {t('common.actions.search')}
                                </Button>
                                {(model.search.kind !== 'all' ||
                                    model.query.length > 0) && (
                                    <Button
                                        variant="default"
                                        onClick={model.resetSearch}
                                    >
                                        {t('common.actions.clear')}
                                    </Button>
                                )}
                            </Group>
                        </form>
                        <ResourceResults
                            loading={model.loading}
                            error={model.error}
                            loadingLabel={t('resources.printers.loading')}
                            errorTitle={t('resources.printers.unavailable')}
                            onRetry={model.reload}
                            empty={model.printers.length === 0}
                            emptyTitle={t(
                                model.search.kind === 'all'
                                    ? 'resources.printers.empty'
                                    : 'resources.printers.notFound',
                            )}
                            emptyDescription={t(
                                model.search.kind === 'all'
                                    ? 'resources.printers.emptyDescription'
                                    : 'resources.printers.notFoundDescription',
                            )}
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
                                        ? t('resources.printers.new')
                                        : t('common.messages.showAll', {
                                              resource: t('printersLower'),
                                          })}
                                </Button>
                            }
                        >
                            <Table.ScrollContainer minWidth={1000}>
                                <Table
                                    verticalSpacing="md"
                                    highlightOnHover
                                    aria-label={t('resources.printers.results')}
                                >
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>{t('printer')}</Table.Th>
                                            <Table.Th>
                                                {t('common.fields.assetNumber')}
                                            </Table.Th>
                                            <Table.Th>
                                                {t('common.fields.ipAddress')}
                                            </Table.Th>
                                            <Table.Th>
                                                {t('common.fields.branch')}
                                            </Table.Th>
                                            <Table.Th>
                                                {t('common.fields.department')}
                                            </Table.Th>
                                            <Table.Th>
                                                {t('common.fields.condition')}
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
                                    {t('common.pagination', {
                                        from: model.firstIndex + 1,
                                        to: model.lastIndex,
                                        count: model.printers.length,
                                        resource: t('printersLower'),
                                    })}
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
