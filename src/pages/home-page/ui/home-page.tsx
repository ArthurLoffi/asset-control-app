import {
    Button,
    Container,
    Group,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Title,
} from '@mantine/core';
import {IconHome, IconRefresh} from '@tabler/icons-react';
import {lazy, Suspense, type ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {useDashboard} from '../model/use-dashboard';
import {MetricCard} from './dashboard-components';
import {InventoryTable} from './inventory-table';
import {translateMessage, ResourceResults} from '@/shared';

const DashboardCharts = lazy(async () => import('./dashboard-charts'));

export default function HomePage(): ReactElement {
    const {t} = useTranslation();
    const {summary, loading, error, reload} = useDashboard();
    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                <Group justify="space-between">
                    <Group wrap="nowrap">
                        <ThemeIcon size={48} radius="md" variant="light">
                            <IconHome size={26} />
                        </ThemeIcon>
                        <div>
                            <Title order={1} size="h2">
                                {t('dashboard.title')}
                            </Title>
                            <Text c="dimmed" size="sm">
                                {t('dashboard.description')}
                            </Text>
                        </div>
                    </Group>
                    <Button
                        variant="subtle"
                        leftSection={<IconRefresh size={16} />}
                        disabled={loading}
                        onClick={reload}
                    >
                        {t('common.actions.refresh')}
                    </Button>
                </Group>
                <ResourceResults
                    loading={loading}
                    error={translateMessage(error, t)}
                    loadingLabel={t('dashboard.loading')}
                    errorTitle={t('dashboard.unavailable')}
                    onRetry={reload}
                    empty={
                        summary?.total === 0 && summary.metrics[0].value === 0
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
                                    <MetricCard key={metric.href} {...metric} />
                                ))}
                            </SimpleGrid>
                            <Text size="sm" c="dimmed">
                                {t('dashboard.recordDescription')}
                            </Text>
                            <Suspense
                                fallback={
                                    <Text c="dimmed" size="sm" role="status">
                                        {t('dashboard.loadingCharts')}
                                    </Text>
                                }
                            >
                                <DashboardCharts summary={summary} />
                            </Suspense>
                            <InventoryTable records={summary.recentRecords} />
                        </>
                    )}
                </ResourceResults>
            </Stack>
        </Container>
    );
}
