import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        excludeSpecPattern: [
            '**/*.html',
        ],
        video: true,
    },
});
