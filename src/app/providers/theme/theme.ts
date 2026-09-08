import {createTheme, type MantineColorsTuple} from '@mantine/core';

// Brand accent — generated 10-shade scale from #004AAD (base at index 6).
const brand: MantineColorsTuple = [
    '#edf8f2',
    '#d2efdd',
    '#a7dfbd',
    '#79cf9a',
    '#52c17c',
    '#35b568',
    '#22a95a',
    '#168f4a',
    '#0c763c',
    '#045f30',
];

export const theme = createTheme({
    primaryColor: 'brand',
    colors: {
        brand,
    },
    fontFamily:
        'Inter Variable, Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    headings: {
        fontFamily:
            'Inter Variable, Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontWeight: '600',
    },
    defaultRadius: 'sm',
    radius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '14px',
    },
    spacing: {
        xs: '6px',
        sm: '10px',
        md: '14px',
        lg: '20px',
        xl: '28px',
    },
    shadows: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.06)',
        md: '0 2px 6px rgba(0, 0, 0, 0.08)',
        lg: '0 4px 12px rgba(0, 0, 0, 0.10)',
        xl: '0 8px 24px rgba(0, 0, 0, 0.12)',
    },
    components: {
        Button: {
            defaultProps: {
                radius: 'sm',
            },
        },
        Paper: {
            defaultProps: {
                radius: 'sm',
                shadow: 'xs',
            },
        },
        Card: {
            defaultProps: {
                radius: 'sm',
                shadow: 'xs',
                withBorder: true,
            },
        },
    },
});
