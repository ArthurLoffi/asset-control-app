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
import {useDashboard} from '../model/use-dashboard';
import {MetricCard} from './dashboard-components';
import {InventoryTable} from './inventory-table';
import {ResourceResults} from '@/shared';

const DashboardCharts = lazy(async () => import('./dashboard-charts'));

export default function HomePage(): ReactElement {
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
                                Dashboard
                            </Title>
                            <Text c="dimmed" size="sm">
                                An overview of your registered inventory.
                            </Text>
                        </div>
                    </Group>
                    <Button
                        variant="subtle"
                        leftSection={<IconRefresh size={16} />}
                        disabled={loading}
                        onClick={reload}
                    >
                        Refresh
                    </Button>
                </Group>
                <ResourceResults
                    loading={loading}
                    error={error}
                    loadingLabel="Loading dashboard…"
                    errorTitle="Unable to load dashboard"
                    onRetry={reload}
                    empty={
                        summary?.total === 0 && summary.metrics[0].value === 0
                    }
                    emptyTitle="No records yet"
                    emptyDescription="Registered employees and inventory will appear here."
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
                                Counts reflect inventory records. Phone records
                                include SIM-only entries; monitor records may
                                indicate no monitor.
                            </Text>
                            <Suspense
                                fallback={
                                    <Text c="dimmed" size="sm" role="status">
                                        Loading charts…
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
