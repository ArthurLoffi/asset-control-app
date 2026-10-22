// @vitest-environment jsdom
import {act, renderHook} from '@testing-library/react';
import type {KeyboardEvent} from 'react';
import {describe, expect, it} from 'vitest';
import {useCapsLock} from './use-caps-lock';

function keyEvent(isCapsLockOn: boolean): KeyboardEvent<HTMLInputElement> {
    return {
        getModifierState: (key: string) => key === 'CapsLock' && isCapsLockOn,
    } as unknown as KeyboardEvent<HTMLInputElement>;
}

describe('useCapsLock', () => {
    it('tracks Caps Lock from key events and clears it on blur', () => {
        const {result} = renderHook(() => useCapsLock());
        expect(result.current.capsLock).toBe(false);
        act(() => {
            result.current.detect(keyEvent(true));
        });
        expect(result.current.capsLock).toBe(true);
        act(() => {
            result.current.reset();
        });
        expect(result.current.capsLock).toBe(false);
    });
});
