import {Alert, Button, Center, Loader, Stack, Text, Title} from '@mantine/core';
import type {ReactElement, ReactNode} from 'react';

type ResourceResultsProps = {
    loading: boolean;
    error?: string;
    loadingLabel: string;
    errorTitle: string;
    onRetry: () => void;
    empty: boolean;
    emptyTitle: string;
    emptyDescription: string;
    emptyAction?: ReactNode;
    children: ReactNode;
};

export function ResourceResults({
    loading,
    error,
    loadingLabel,
    errorTitle,
    onRetry,
    empty,
    emptyTitle,
    emptyDescription,
    emptyAction,
    children,
}: ResourceResultsProps): ReactElement {
    if (loading) {
        return (
            <Center py={70}>
                <Stack align="center">
                    <Loader size="sm" />
                    <Text size="sm" c="dimmed" role="status">
                        {loadingLabel}
                    </Text>
                </Stack>
            </Center>
        );
    }

    if ((error?.length ?? 0) > 0) {
        return (
            <Alert color="red" title={errorTitle} role="alert">
                <Stack gap="sm">
                    <Text size="sm">{error}</Text>
                    <Button
                        variant="light"
                        color="red"
                        size="xs"
                        onClick={onRetry}
                        style={{alignSelf: 'flex-start'}}
                    >
                        Try again
                    </Button>
                </Stack>
            </Alert>
        );
    }

    if (empty) {
        return (
            <Stack align="center" py={60} gap="sm" role="status">
                <Title order={3} size="h4">
                    {emptyTitle}
                </Title>
                <Text c="dimmed" size="sm" ta="center">
                    {emptyDescription}
                </Text>
                {emptyAction}
            </Stack>
        );
    }

    return <>{children}</>;
}
