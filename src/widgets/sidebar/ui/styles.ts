import type {ComponentProps} from 'react';
import {NavLink as RouterNavLink} from 'react-router-dom';
import styled from 'styled-components';

type WrapperProps = {
    $open?: boolean;
} & ComponentProps<'div'>;

export const Wrapper = styled.div<WrapperProps>(({$open}) => ({
    display: $open ? 'flex' : 'none',
    flexDirection: 'column',
    gap: '4px',
    width: '100%',
    height: '100%',
    overflowY: 'auto',
    scrollbarWidth: 'none',
}));

export const Li = styled.div({
    minWidth: 0,
});

export const NavLink = styled(RouterNavLink)({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minHeight: '44px',
    padding: '10px 14px',
    borderRadius: 'var(--mantine-radius-md)',
    color: 'var(--mantine-color-text)',
    fontSize: 'var(--mantine-font-size-sm)',
    fontWeight: 500,
    textDecoration: 'none',
    overflowWrap: 'anywhere',
    transition: 'background-color 150ms ease, color 150ms ease',
    '& svg': {
        flexShrink: 0,
        color: 'var(--mantine-color-dimmed)',
        transition: 'color 150ms ease',
    },
    '&:hover': {
        backgroundColor: 'var(--mantine-color-default-hover)',
    },
    '&.active': {
        backgroundColor: 'var(--mantine-primary-color-light)',
        boxShadow: 'inset 3px 0 0 var(--mantine-primary-color-filled)',
        color: 'var(--mantine-primary-color-light-color)',
        fontWeight: 600,
    },
    '&.active svg': {
        color: 'var(--mantine-primary-color-light-color)',
    },
    '&:focus-visible': {
        outline: '2px solid var(--mantine-primary-color-filled)',
        outlineOffset: '2px',
    },
    '@media (prefers-reduced-motion: reduce)': {
        transition: 'none',
    },
});
