import {Anchor, Badge, Group, Paper, Stack, Text, Title} from '@mantine/core';
import {IconArrowUpRight} from '@tabler/icons-react';
import type {ReactElement, ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import {translateInventoryValue} from '@/shared';

export function MetricCard({
    label,
    value,
    href,
}: {
    label: string;
    value: number;
    href: string;
}): ReactElement {
    const {t} = useTranslation();
    const metricKey = {
        'Registered employees': 'registeredEmployees',
        Machines: 'machines',
        'Monitor records': 'monitorRecords',
        'Phone records': 'phoneRecords',
        Printers: 'printers',
    }[label];
    const localizedLabel =
        metricKey === undefined ? label : t(`dashboard.${metricKey}`);
    return (
        <Paper withBorder p="lg">
            <Stack gap="sm">
                <Group justify="space-between" wrap="nowrap">
                    <Text size="md" c="dimmed" fw={500}>
                        {localizedLabel}
                    </Text>
                    <Anchor
                        component={Link}
                        to={href}
                        aria-label={t('viewRecord', {
                            record: localizedLabel.toLowerCase(),
                        })}
                        style={{display: 'inline-flex'}}
                    >
                        <IconArrowUpRight size={18} />
                    </Anchor>
                </Group>
                <Text fz={32} fw={700} lh={1.2}>
                    {value}
                </Text>
            </Stack>
        </Paper>
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
                        <Text c="dimmed" size="sm">
                            {description}
                        </Text>
                    )}
                </div>
                {children}
            </Stack>
        </Paper>
    );
}

export function StatusBadge({status}: {status?: string}): ReactElement {
    const {t} = useTranslation();
    return status === undefined ? (
        <Text c="dimmed" size="sm">
            {t('common.labels.notApplicable')}
        </Text>
    ) : (
        <Badge variant="light">
            {status.length > 0
                ? (translateInventoryValue(status, t) ?? status)
                : t('common.labels.notRecorded')}
        </Badge>
    );
}
