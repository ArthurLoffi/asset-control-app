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
import {useTranslation} from 'react-i18next';
import type {DashboardSummary} from '../model/dashboard';
import {ChartPanel} from './dashboard-components';
import {translateInventoryValue} from '@/shared';

export default function DashboardCharts({
    summary,
}: {
    summary: DashboardSummary;
}): ReactElement {
    const {t, i18n} = useTranslation();
    const formatPercentage = (value: number): string =>
        new Intl.NumberFormat(i18n.language, {
            style: 'percent',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
        }).format(value / 100);
    const theme = useMantineTheme();
    const statuses = summary.statuses.map((status, index) => ({
        ...status,
        key: status.name,
        name:
            status.name === 'Not recorded'
                ? t('common.labels.notRecorded')
                : (translateInventoryValue(status.name, t) ?? status.name),
        color: `${theme.primaryColor}.${4 + (index % 5)}`,
    }));
    return (
        <Stack gap="lg">
            <SimpleGrid cols={{base: 1, lg: 2}} spacing="lg">
                <ChartPanel
                    title={t('dashboard.inventoryByDepartment')}
                    description={t(
                        'dashboard.inventoryByDepartmentDescription',
                    )}
                >
                    {summary.total === 0 ? (
                        <Text c="dimmed" size="sm">
                            {t('dashboard.noInventory')}
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
                                        label: t('dashboard.records'),
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
                    title={t('dashboard.recordedStatus')}
                    description={t('dashboard.recordedStatusDescription')}
                >
                    {summary.statusTotal === 0 ? (
                        <Text c="dimmed" size="sm">
                            {t('dashboard.noRecordsWithStatus')}
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
                                    {t('dashboard.totalRecords')}
                                </Text>
                            </Stack>
                            <Stack gap="sm" style={{flex: 1, minWidth: 180}}>
                                {statuses.map((status) => (
                                    <Group
                                        key={status.key}
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
                                                (
                                                {formatPercentage(
                                                    status.percentage,
                                                )}
                                                )
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
                title={t('dashboard.branchDistribution')}
                description={t('dashboard.branchDistributionDescription')}
            >
                {summary.total === 0 ? (
                    <Text c="dimmed" size="sm">
                        {t('dashboard.noInventory')}
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
                                            {formatPercentage(
                                                (branch.value / summary.total) *
                                                    100,
                                            )}
                                            )
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
