import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            all: true,
            clean: true,
            enabled: true,
            include: ['src/**/*.ts'],
            provider: 'c8',
        },
        dir: 'src',
        environment: 'jsdom',
        include: ['**/*.spec.ts'],
    },
});
