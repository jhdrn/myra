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
                formats: isMinified ? ['umd'] : ['es', 'umd'],
                fileName: (format) => {
                    if (isMinified) return 'myra.min.js'
                    return format === 'es' ? 'myra.mjs' : 'myra.js'
                },
            },
            rolldownOptions: {
                output: {
                    banner,
                },
            },
            outDir: 'dist',
            emptyOutDir: !isMinified,
            sourcemap: !isMinified,
            minify: isMinified ? 'esbuild' : false,
        },
    }
})
