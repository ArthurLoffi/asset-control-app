import {createTheme, type MantineColorsTuple} from '@mantine/core';

// Brand accent — 10-shade green scale (base at index 6).
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

// Cool neutral surfaces for the default dark scheme. Index 2 (dimmed text)
// keeps at least 4.5:1 contrast on Card (index 6), body (7), and canvas (8).
const dark: MantineColorsTuple = [
    '#C9CDD3',
    '#B4BAC2',
    '#9AA1AB',
    '#6C737D',
    '#474D56',
    '#393E46',
    '#2C3038',
    '#1F2228',
    '#181A1F',
    '#111316',
];

export const theme = createTheme({
    primaryColor: 'brand',
    colors: {
        brand,
        dark,
    },
    cursorType: 'pointer',
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
        Badge: {
            styles: {
                root: {
                    height: 'auto',
                    minHeight: 'var(--badge-height)',
                    maxWidth: '100%',
                },
                label: {whiteSpace: 'normal', overflowWrap: 'anywhere'},
            },
        },
        Button: {
            styles: {
                root: {
                    height: 'auto',
                    minHeight: 'var(--button-height)',
                    maxWidth: '100%',
                    paddingBlock: 8,
                },
                label: {
                    whiteSpace: 'normal',
                    overflow: 'visible',
                    height: 'auto',
                    overflowWrap: 'anywhere',
                },
                inner: {height: 'auto'},
            },
            defaultProps: {
                radius: 'sm',
            },
        },
        Paper: {
            defaultProps: {
                radius: 'md',
                shadow: 'xs',
            },
        },
        Card: {
            defaultProps: {
                radius: 'md',
                shadow: 'xs',
                withBorder: true,
            },
        },
        ThemeIcon: {
            defaultProps: {
                radius: 'md',
            },
        },
        Table: {
            defaultProps: {
                highlightOnHover: true,
            },
            styles: {
                th: {
                    color: 'var(--mantine-color-dimmed)',
                    fontSize: 'var(--mantine-font-size-xs)',
                    fontWeight: 600,
                },
            },
        },
    },
});
