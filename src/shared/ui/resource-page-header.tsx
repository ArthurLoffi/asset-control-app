import {Button, Group, Text, ThemeIcon, Title} from '@mantine/core';
import {IconPlus} from '@tabler/icons-react';
import type {ReactElement, ReactNode} from 'react';

type ResourcePageHeaderProps = {
    title: string;
    description: string;
    icon: ReactNode;
    newLabel: string;
    onCreate: () => void;
};

export function ResourcePageHeader({
    title,
    description,
    icon,
    newLabel,
    onCreate,
}: ResourcePageHeaderProps): ReactElement {
    return (
        <Group justify="space-between">
            <Group wrap="nowrap">
                <ThemeIcon size={48} radius="md" variant="light">
                    {icon}
                </ThemeIcon>
                <div>
                    <Title order={1} size="h2">
                        {title}
                    </Title>
                    <Text c="dimmed" size="sm">
                        {description}
                    </Text>
                </div>
            </Group>
            <Button leftSection={<IconPlus size={18} />} onClick={onCreate}>
                {newLabel}
            </Button>
        </Group>
    );
}
