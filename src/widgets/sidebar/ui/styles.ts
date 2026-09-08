import type { ComponentProps } from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import styled from 'styled-components';

type WrapperProps = {
  $open?: boolean;
} & ComponentProps<'div'>;

export const Wrapper = styled.div<WrapperProps>(({ $open }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: $open ? '300px' : '0px',
  padding: '20px',
  height: '100dvh',
  overflow: 'auto',
  scrollbarWidth: 'none',
}));

export const Li = styled.div({
  marginTop: '10px',
  marginLeft: '10px',
});

export const NavLink = styled(RouterNavLink)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  textDecoration: 'none',
  color: 'inherit',
  padding: '8px 16px',
  borderRadius: '8px',
  '&:hover, &.active': {
    backgroundColor: '#3E444C',
    maxWidth: '90%'
  },
});