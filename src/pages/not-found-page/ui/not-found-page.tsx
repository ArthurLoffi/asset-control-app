import {Button, Center, Stack, Text, ThemeIcon, Title} from '@mantine/core';
import {IconArrowLeft, IconMapOff} from '@tabler/icons-react';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import {ROUTES} from '@/shared';

export function NotFoundPage(): ReactElement {
    const {t} = useTranslation();
    return (
        <Center py={80}>
            <Stack align="center" gap="sm" maw={420} ta="center">
                <ThemeIcon size={64} radius="md" variant="light">
                    <IconMapOff size={32} aria-hidden />
                </ThemeIcon>
                <Text c="dimmed" fw={600} size="sm">
                    404
                </Text>
                <Title order={1} size="h2">
                    {t('notFound.title')}
                </Title>
                <Text c="dimmed" size="sm">
                    {t('notFound.description')}
                </Text>
                <Button
                    component={Link}
                    to={ROUTES.HOME}
                    mt="sm"
                    leftSection={<IconArrowLeft size={18} />}
                >
                    {t('notFound.backHome')}
                </Button>
            </Stack>
        </Center>
    );
}
