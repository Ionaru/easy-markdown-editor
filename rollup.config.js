import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import cleaner from 'rollup-plugin-cleaner';
import scss from 'rollup-plugin-scss';

export default [
    // Browser configuration
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/browser/easymde.min.js',
            inlineDynamicImports: true,
            sourcemap: true,
        },
        plugins: [
            cleaner({
                targets: ['./dist/'],
            }),
            nodeResolve(),
            scss({
                fileName: 'easymde.css',
            }),
            typescript(),
            terser(),
        ],
    },
];
