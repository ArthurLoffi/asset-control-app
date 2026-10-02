import path from 'node:path';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
    plugins: [react()],
    server: {
        allowedHosts: ['app.msapplications.online'],
        proxy: {
            '/api': 'http://localhost:8060',
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, './src'),
        },
    },
});
