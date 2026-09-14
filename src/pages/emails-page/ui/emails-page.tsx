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
import {useEmailsPage} from '../model/use-emails-page';
import {EmailForm} from '@/features';
import {formatRecordDate, ResourcePageHeader, ResourceResults} from '@/shared';

export function EmailsPage(): ReactElement {
    const model = useEmailsPage();
    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                <ResourcePageHeader
                    title="Emails"
                    description="Find email accounts and keep their details up to date."
                    icon={<IconMail size={26} />}
                    newLabel="New email"
                    onCreate={() => {
                        model.openForm();
                    }}
                />
                {model.notice.length > 0 && (
                    <Alert color="green" title="Success" role="status">
                        {model.notice}
                    </Alert>
                )}
                <Paper withBorder p="lg">
                    <Stack gap="lg">
                        <Group justify="space-between">
                            <Group gap="sm">
                                <Title order={2} size="h4">
                                    Email accounts
                                </Title>
                                {!model.loading && model.error.length === 0 && (
                                    <Badge variant="light">
                                        {model.emails.length}{' '}
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
                            <Stack gap="xs">
                                <Group align="flex-end">
                                    <Select
                                        label="Search by"
                                        data={[
                                            {value: 'user', label: 'User'},
                                            {value: 'id', label: 'ID'},
                                        ]}
                                        value={model.kind}
                                        onChange={model.changeKind}
                                        allowDeselect={false}
                                        style={{width: 140}}
                                    />
                                    <TextInput
                                        label={
                                            model.kind === 'id'
                                                ? 'Email ID'
                                                : 'User'
                                        }
                                        placeholder={
                                            model.kind === 'id'
                                                ? 'Enter an email ID'
                                                : 'Enter a user'
                                        }
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
                                        leftSection={<IconSearch size={16} />}
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
                                <Text size="xs" c="dimmed">
                                    User search ignores case and matches part of
                                    a name. If several accounts match, the first
                                    by ID is shown.
                                </Text>
                            </Stack>
                        </form>
                        <ResourceResults
                            loading={model.loading}
                            error={model.error}
                            loadingLabel="Loading emails…"
                            errorTitle="Unable to load emails"
                            onRetry={model.reload}
                            empty={model.emails.length === 0}
                            emptyTitle={
                                model.search.kind === 'all'
                                    ? 'No emails yet'
                                    : 'No email found'
                            }
                            emptyDescription={
                                model.search.kind === 'all'
                                    ? 'Create your first email account to get started.'
                                    : 'Check the user or ID and try again.'
                            }
                        >
                            <Table.ScrollContainer minWidth={760}>
                                <Table
                                    verticalSpacing="md"
                                    highlightOnHover
                                    aria-label="Email search results"
                                >
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>User</Table.Th>
                                            <Table.Th>Email address</Table.Th>
                                            <Table.Th>Password</Table.Th>
                                            <Table.Th>Added</Table.Th>
                                            <Table.Th>Actions</Table.Th>
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
                                                        aria-label={`Password for ${email.email}`}
                                                        visibilityToggleButtonProps={{
                                                            'aria-label': `Toggle password for ${email.email}`,
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
                                                        aria-label={`Edit ${email.email}`}
                                                        onClick={() => {
                                                            model.openForm(
                                                                email,
                                                            );
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Table.ScrollContainer>
                            <Group justify="space-between">
                                <Text size="sm" c="dimmed">
                                    Showing {model.firstIndex + 1}–
                                    {model.lastIndex} of {model.emails.length}{' '}
                                    emails
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
                />
            )}
        </Container>
    );
}
