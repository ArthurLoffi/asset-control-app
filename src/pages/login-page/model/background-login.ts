import type {CSSProperties} from 'react';

type LoginBackgroundStyleCss = CSSProperties & {
    '--login-background-image': string;
};

function resolveLoginBackgroundSource(configuredSource: unknown): string {
    if (typeof configuredSource === 'string') {
        const source = configuredSource.trim();
        if (source.length > 0) {
            return source;
        }
    }

    return '/login-hero.jpg';
}

const loginBackgroundSource = resolveLoginBackgroundSource(
    import.meta.env.VITE_LOGIN_BACKGROUND,
);

export const LoginBackgroundStyle: LoginBackgroundStyleCss = {
    '--login-background-image': `url(${JSON.stringify(loginBackgroundSource)})`,
};
