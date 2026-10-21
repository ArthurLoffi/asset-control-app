import {
    Button,
    Container,
    Group,
    SimpleGrid,
    Skeleton,
    Stack,
    Text,
    ThemeIcon,
    Title,
    VisuallyHidden,
} from '@mantine/core';
import {
    IconInfoCircle,
    IconLayoutDashboard,
    IconRefresh,
} from '@tabler/icons-react';
import {lazy, Suspense, type ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {useDashboard} from '../model/use-dashboard';
import {MetricCard} from './dashboard-components';
import {RecentChangesTable} from './recent-changes-table';
import {translateMessage, ResourceResults} from '@/shared';

const DashboardCharts = lazy(async () => import('./dashboard-charts'));

function ChartsSkeleton(): ReactElement {
    const {t} = useTranslation();
    return (
        <Stack gap="lg">
            <VisuallyHidden role="status">
                {t('dashboard.loadingCharts')}
            </VisuallyHidden>
            <SimpleGrid cols={{base: 1, lg: 2}} spacing="lg">
                <Skeleton h={340} radius="md" />
                <Skeleton h={340} radius="md" />
            </SimpleGrid>
            <Skeleton h={180} radius="md" />
        </Stack>
    );
}

export default function HomePage(): ReactElement {
    const {t, i18n} = useTranslation();
    const {summary, changes, updatedAt, loading, error, reload} =
        useDashboard();
    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                <Group justify="space-between" align="center">
                    <Group
                        wrap="nowrap"
                        style={{minWidth: 0, flex: '1 1 260px'}}
                    >
                        <ThemeIcon size={48} radius="md" variant="light">
                            <IconLayoutDashboard size={26} aria-hidden />
                        </ThemeIcon>
                        <div style={{minWidth: 0}}>
                            <Title order={1} size="h2">
                                {t('dashboard.title')}
                            </Title>
                            <Text c="dimmed" size="sm">
                                {t('dashboard.description')}
                            </Text>
                        </div>
                    </Group>
                    <Group gap="sm" wrap="wrap">
                        {updatedAt !== undefined && !loading && (
                            <Text size="sm" c="dimmed">
                                {t('dashboard.updatedAt', {
                                    time: new Intl.DateTimeFormat(
                                        i18n.language,
                                        {timeStyle: 'short'},
                                    ).format(updatedAt),
                                })}
                            </Text>
                        )}
                        <Button
                            variant="default"
                            leftSection={<IconRefresh size={16} aria-hidden />}
                            loading={loading}
                            onClick={reload}
                        >
                            {t('common.actions.refresh')}
                        </Button>
                    </Group>
                </Group>
                <ResourceResults
                    loading={loading}
                    error={translateMessage(error, t)}
                    loadingLabel={t('dashboard.loading')}
                    errorTitle={t('dashboard.unavailable')}
                    onRetry={reload}
                    empty={
                        summary?.total === 0 &&
                        summary.metrics[0].value === 0 &&
                        changes.length === 0
                    }
                    emptyTitle={t('dashboard.noRecords')}
                    emptyDescription={t('dashboard.emptyDescription')}
                >
                    {summary !== undefined && (
                        <>
                            <SimpleGrid
                                cols={{base: 1, xs: 2, sm: 3, lg: 5}}
                                spacing="lg"
                            >
                                {summary.metrics.map((metric) => (
                                    <MetricCard
                                        key={metric.key}
                                        metric={metric}
                                    />
                                ))}
                            </SimpleGrid>
                            <Group gap="xs" wrap="nowrap" align="flex-start">
                                <IconInfoCircle
                                    size={16}
                                    aria-hidden
                                    style={{
                                        flexShrink: 0,
                                        marginTop: 2,
                                        color: 'var(--mantine-color-dimmed)',
                                    }}
                                />
                                <Text size="sm" c="dimmed">
                                    {t('dashboard.recordDescription')}
                                </Text>
                            </Group>
                            <Suspense fallback={<ChartsSkeleton />}>
                                <DashboardCharts summary={summary} />
                            </Suspense>
                            <RecentChangesTable changes={changes} />
                        </>
                    )}
                </ResourceResults>
            </Stack>
        </Container>
    );
}
