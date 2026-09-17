import {
    Alert,
    Badge,
    Button,
    Container,
    Group,
    Paper,
    Pagination,
    PasswordInput,
    Select,
    Stack,
    Table,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import {IconMail, IconRefresh, IconSearch} from '@tabler/icons-react';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {useEmailsPage, type EmailSortKey} from '../model/use-emails-page';
import {
    translateMessage,
    formatRecordDate,
    ResourcePageHeader,
    ResourceResults,
    SortableTableHeader,
} from '@/shared';
import {EmailForm} from '@/features';

export function EmailsPage(): ReactElement {
    const {t} = useTranslation();
    const model = useEmailsPage();
    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                <ResourcePageHeader
                    title={t('resources.emails.title')}
                    description={t('resources.emails.description')}
                    icon={<IconMail size={26} />}
                    newLabel={t('resources.emails.new')}
                    onCreate={() => {
                        model.openForm();
                    }}
                />
                {model.notice.length > 0 && (
                    <Alert color="green" title={t('success')} role="status">
                        {translateMessage(model.notice, t)}
                    </Alert>
                )}
                <Paper withBorder p="lg">
                    <Stack gap="lg">
                        <Group justify="space-between">
                            <Group gap="sm">
                                <Title order={2} size="h4">
                                    {t('resources.emails.inventory')}
                                </Title>
                                {!model.loading && model.error.length === 0 && (
                                    <Badge variant="light">
                                        {model.emails.length}{' '}
                                        {t(
                                            model.search.kind === 'all'
                                                ? 'common.labels.total'
                                                : 'common.labels.found',
                                            {count: model.emails.length},
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
                            <Stack gap="xs">
                                <Group align="flex-end">
                                    <Select
                                        label={t('searchBy')}
                                        data={[
                                            {
                                                value: 'user',
                                                label: t('common.fields.user'),
                                            },
                                            {value: 'id', label: 'ID'},
                                        ]}
                                        value={model.kind}
                                        onChange={model.changeKind}
                                        allowDeselect={false}
                                        style={{width: 140}}
                                    />
                                    <TextInput
                                        label={t(
                                            model.kind === 'id'
                                                ? 'emailId'
                                                : 'common.fields.user',
                                        )}
                                        placeholder={t(
                                            model.kind === 'id'
                                                ? 'enterEmailId'
                                                : 'enterUser',
                                        )}
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
                                        leftSection={<IconSearch size={16} />}
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
                                <Text size="xs" c="dimmed">
                                    {t('resources.emails.searchHelp')}
                                </Text>
                            </Stack>
                        </form>
                        <ResourceResults
                            loading={model.loading}
                            error={model.error}
                            loadingLabel={t('resources.emails.loading')}
                            errorTitle={t('resources.emails.unavailable')}
                            onRetry={model.reload}
                            empty={model.emails.length === 0}
                            emptyTitle={t(
                                model.search.kind === 'all'
                                    ? 'resources.emails.empty'
                                    : 'resources.emails.notFound',
                            )}
                            emptyDescription={t(
                                model.search.kind === 'all'
                                    ? 'resources.emails.emptyDescription'
                                    : 'resources.emails.notFoundDescription',
                            )}
                        >
                            <Table.ScrollContainer minWidth={760}>
                                <Table
                                    verticalSpacing="md"
                                    highlightOnHover
                                    aria-label={t('resources.emails.results')}
                                >
                                    <Table.Thead>
                                        <Table.Tr>
                                            {(
                                                [
                                                    [
                                                        'user',
                                                        t('common.fields.user'),
                                                    ],
                                                    [
                                                        'email',
                                                        t(
                                                            'common.fields.emailAddress',
                                                        ),
                                                    ],
                                                    [
                                                        'password',
                                                        t(
                                                            'common.fields.password',
                                                        ),
                                                    ],
                                                    [
                                                        'added',
                                                        t(
                                                            'common.fields.added',
                                                        ),
                                                    ],
                                                ] as Array<
                                                    [EmailSortKey, string]
                                                >
                                            ).map(([column, label]) => (
                                                <SortableTableHeader
                                                    key={column}
                                                    column={column}
                                                    label={label}
                                                    sort={model.sort}
                                                    onSort={model.toggleSort}
                                                />
                                            ))}
                                            <Table.Th>
                                                {t('common.fields.actions')}
                                            </Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {model.visibleEmails.map((email) => (
                                            <Table.Tr key={email.id}>
                                                <Table.Td>
                                                    <Text size="sm" fw={500}>
                                                        {email.user}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        ID #{email.id}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm">
                                                        {email.email}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <PasswordInput
                                                        visibilityToggleFocusable
                                                        readOnly
                                                        value={
                                                            email.password_hash
                                                        }
                                                        aria-label={t(
                                                            'passwordFor',
                                                            {
                                                                email: email.email,
                                                            },
                                                        )}
                                                        visibilityToggleButtonProps={{
                                                            'aria-label': t(
                                                                'togglePasswordFor',
                                                                {
                                                                    email: email.email,
                                                                },
                                                            ),
                                                        }}
                                                        style={{minWidth: 190}}
                                                    />
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm" c="dimmed">
                                                        {formatRecordDate(
                                                            email.created_at,
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
                                                                record: email.email,
                                                            },
                                                        )}
                                                        onClick={() => {
                                                            model.openForm(
                                                                email,
                                                            );
                                                        }}
                                                    >
                                                        {t(
                                                            'common.actions.edit',
                                                        )}
                                                    </Button>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Table.ScrollContainer>
                            <Group justify="space-between">
                                <Text size="sm" c="dimmed">
                                    {t('common.pagination', {
                                        from: model.firstIndex + 1,
                                        to: model.lastIndex,
                                        count: model.emails.length,
                                        resource: t('emailsLower'),
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
                <EmailForm
                    email={model.form.email}
                    onClose={model.closeForm}
                    onSaved={model.onSaved}
                    onDeactivated={model.onDeactivated}
                />
            )}
        </Container>
    );
}
