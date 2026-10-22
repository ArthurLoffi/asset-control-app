import {useState, type KeyboardEvent} from 'react';

export function useCapsLock(): {
    capsLock: boolean;
    detect: (event: KeyboardEvent<HTMLInputElement>) => void;
    reset: () => void;
} {
    const [capsLock, setCapsLock] = useState(false);
    return {
        capsLock,
        detect(event) {
            setCapsLock(event.getModifierState('CapsLock'));
        },
        reset() {
            setCapsLock(false);
        },
    };
}
