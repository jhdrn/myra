import { defineConfig } from 'vite'

const banner = '/** @license MIT https://github.com/jhdrn/myra/blob/master/LICENSE - Copyright (c) Jonathan Hedrén */'

export default defineConfig(({ mode }) => {
    const isMinified = mode === 'minified'

    return {
        build: {
            target: 'es2015',
            lib: {
                entry: 'src/myra.ts',
                name: 'myra',
                formats: isMinified ? ['umd'] : undefined,
            },
            rolldownOptions: {
                output: isMinified
                    ? { format: 'umd', entryFileNames: 'myra.min.js', name: 'myra', banner }
                    : [
                        { format: 'es', entryFileNames: 'myra.mjs', banner },
                        { format: 'umd', entryFileNames: 'myra.cjs', name: 'myra', banner },
                        { format: 'umd', entryFileNames: 'myra.js', name: 'myra', banner },
                    ],
            },
            outDir: 'dist',
            emptyOutDir: !isMinified,
            sourcemap: !isMinified,
            minify: isMinified,
        },
    }
})
