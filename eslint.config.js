import eslintConfigXo from 'eslint-config-xo';
import {defineConfig} from 'eslint/config';

export default defineConfig([
    ...eslintConfigXo({
        browser: true,
        space: 4,
        semicolon: true,
        prettier: true,
    }),

    {
        ignores: [
            'dist/**',
            'node_modules/**',
            'package-lock.json',
            'tsconfig*.json',
        ],
    },

    {
        rules: {
            '@typescript-eslint/naming-convention': 'off',
            'unicorn/default-export-style': 'off',
            '@html-eslint/require-open-graph-protocol': 'off',
        },
    },
]);
