import {Card, Group, Paper, Stack, Text, ThemeIcon, Title} from '@mantine/core';
import {
    IconArrowUpRight,
    IconDeviceDesktop,
    IconDeviceLaptop,
    IconDeviceMobile,
    IconPrinter,
    IconUser,
    type Icon,
} from '@tabler/icons-react';
import type {ReactElement, ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import type {DashboardMetric, DashboardMetricKey} from '../model/dashboard';
// CSS side effects require their extension; local TypeScript imports do not.
// eslint-disable-next-line n/file-extension-in-import
import classes from './dashboard.module.css';

const metricLabels: Record<DashboardMetricKey, string> = {
    employees: 'dashboard.registeredEmployees',
    machines: 'dashboard.machines',
    monitors: 'dashboard.monitors',
    phones: 'dashboard.phones',
    printers: 'dashboard.printers',
};

const metricIcons: Record<DashboardMetricKey, Icon> = {
    employees: IconUser,
    machines: IconDeviceLaptop,
    monitors: IconDeviceDesktop,
    phones: IconDeviceMobile,
    printers: IconPrinter,
};

export function MetricCard({
    metric: {key, value, detail, href},
}: {
    metric: DashboardMetric;
}): ReactElement {
    const {t, i18n} = useTranslation();
    const MetricIcon = metricIcons[key];
    const format = (count: number): string =>
        new Intl.NumberFormat(i18n.language).format(count);
    return (
        <Card
            component={Link}
            to={href}
            padding="lg"
            className={classes.metric}
        >
            <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Text size="md" c="dimmed" fw={500}>
                    {t(metricLabels[key])}
                </Text>
                <ThemeIcon variant="light" size={40} radius="md">
                    <MetricIcon size={22} stroke={1.6} aria-hidden />
                </ThemeIcon>
            </Group>
            <Text fz={32} fw={700} lh={1.2} mt="auto">
                {format(value)}
            </Text>
            <Group
                justify="space-between"
                wrap="nowrap"
                gap="xs"
                align="center"
            >
                <Text size="sm" c="dimmed">
                    {t(`dashboard.metricDetails.${key}`, {
                        count: detail,
                        formattedCount: format(detail),
                    })}
                </Text>
                <IconArrowUpRight
                    size={18}
                    className={classes.metricArrow}
                    aria-hidden
                />
            </Group>
        </Card>
    );
}

export function ChartPanel({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}): ReactElement {
    return (
        <Paper withBorder p="lg" style={{minWidth: 0}}>
            <Stack gap="lg">
                <div>
                    <Title order={2} size="h4">
                        {title}
                    </Title>
                    {description !== undefined && (
                        <Text c="dimmed" size="sm" mt={4}>
                            {description}
                        </Text>
                    )}
                </div>
                {children}
            </Stack>
        </Paper>
    );
}
