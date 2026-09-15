import {BarChart, DonutChart} from '@mantine/charts';
import {
    Box,
    Group,
    Progress,
    ScrollArea,
    SimpleGrid,
    Stack,
    Text,
    VisuallyHidden,
    useMantineTheme,
} from '@mantine/core';
import type {ReactElement} from 'react';
import type {DashboardSummary} from '../model/dashboard';
import {ChartPanel} from './dashboard-components';

export default function DashboardCharts({
    summary,
}: {
    summary: DashboardSummary;
}): ReactElement {
    const theme = useMantineTheme();
    const statuses = summary.statuses.map((status, index) => ({
        ...status,
        color: `${theme.primaryColor}.${4 + (index % 5)}`,
    }));
    return (
        <Stack gap="lg">
            <SimpleGrid cols={{base: 1, lg: 2}} spacing="lg">
                <ChartPanel
                    title="Inventory by department"
                    description="From the linked employee or printer location."
                >
                    {summary.total === 0 ? (
                        <Text c="dimmed" size="sm">
                            No inventory records.
                        </Text>
                    ) : (
                        <ScrollArea.Autosize mah={360}>
                            <BarChart
                                h={Math.max(
                                    240,
                                    summary.departments.length * 38,
                                )}
                                data={summary.departments}
                                dataKey="name"
                                orientation="vertical"
                                series={[
                                    {
                                        name: 'value',
                                        label: 'Records',
                                        color: `${theme.primaryColor}.6`,
                                    },
                                ]}
                                withBarValueLabel
                                withTooltip={false}
                                gridAxis="x"
                                tickLine="none"
                                yAxisProps={{
                                    width: 145,
                                    interval: 0,
                                    tick: {fontSize: 11},
                                }}
                                xAxisProps={{allowDecimals: false}}
                                barProps={{isAnimationActive: false}}
                                barChartProps={{margin: {right: 30}}}
                            />
                            <VisuallyHidden>
                                {summary.departments.map((department) => (
                                    <div key={department.key}>
                                        {department.name}: {department.value}
                                    </div>
                                ))}
                            </VisuallyHidden>
                        </ScrollArea.Autosize>
                    )}
                </ChartPanel>
                <ChartPanel
                    title="Recorded status"
                    description="Machine, monitor and phone records. Printers have no status field."
                >
                    {summary.statusTotal === 0 ? (
                        <Text c="dimmed" size="sm">
                            No records with a status field.
                        </Text>
                    ) : (
                        <Group gap="xl" justify="center" align="center">
                            <Stack gap="xs" align="center">
                                <DonutChart
                                    data={statuses}
                                    size={180}
                                    thickness={24}
                                    chartLabel={String(summary.statusTotal)}
                                    withTooltip={false}
                                    pieProps={{isAnimationActive: false}}
                                />
                                <Text c="dimmed" size="sm">
                                    Total records
                                </Text>
                            </Stack>
                            <Stack gap="sm" style={{flex: 1, minWidth: 180}}>
                                {statuses.map((status) => (
                                    <Group
                                        key={status.name}
                                        justify="space-between"
                                        wrap="nowrap"
                                    >
                                        <Group gap="xs" wrap="nowrap">
                                            <Box
                                                w={8}
                                                h={8}
                                                bg={status.color}
                                                style={{
                                                    flexShrink: 0,
                                                    borderRadius:
                                                        theme.radius.xs,
                                                }}
                                            />
                                            <Text size="sm">{status.name}</Text>
                                        </Group>
                                        <Text
                                            size="sm"
                                            style={{whiteSpace: 'nowrap'}}
                                        >
                                            {status.value}{' '}
                                            <Text
                                                component="span"
                                                size="xs"
                                                c="dimmed"
                                            >
                                                ({status.percentage.toFixed(1)}
                                                %)
                                            </Text>
                                        </Text>
                                    </Group>
                                ))}
                            </Stack>
                        </Group>
                    )}
                </ChartPanel>
            </SimpleGrid>
            <ChartPanel
                title="Branch distribution"
                description="All inventory records, including those with no recorded location."
            >
                {summary.total === 0 ? (
                    <Text c="dimmed" size="sm">
                        No inventory records.
                    </Text>
                ) : (
                    <SimpleGrid cols={{base: 1, sm: 2, lg: 3}} spacing="lg">
                        {summary.branches.map((branch) => (
                            <Stack key={branch.key} gap="xs">
                                <Group justify="space-between">
                                    <Text size="sm">{branch.name}</Text>
                                    <Text size="sm">
                                        {branch.value}{' '}
                                        <Text component="span" c="dimmed">
                                            (
                                            {(
                                                (branch.value / summary.total) *
                                                100
                                            ).toFixed(1)}
                                            %)
                                        </Text>
                                    </Text>
                                </Group>
                                <Progress
                                    value={(branch.value / summary.total) * 100}
                                    size="sm"
                                    aria-label={branch.name}
                                />
                            </Stack>
                        ))}
                    </SimpleGrid>
                )}
            </ChartPanel>
        </Stack>
    );
}
