import terser from '@rollup/plugin-terser'
import camelCase from 'lodash.camelcase'

const libraryName = 'myra'

const banner = '/** @license MIT https://github.com/jhdrn/myra/blob/master/LICENSE - Copyright (c) 2016-2024 Jonathan Hedrén */'

export default {
    input: `build/src/${libraryName}.js`,
    output: [
        {
            file: `dist/${libraryName}.min.js`,
            name: camelCase(libraryName),
            format: 'umd',
            banner,
            sourcemap: false,
            plugins: [terser()]
        },
        {
            file: `dist/${libraryName}.js`,
            name: camelCase(libraryName),
            format: 'umd',
            banner,
            sourcemap: true,
        },
        {
            file: `dist/${libraryName}.mjs`,
            name: camelCase(libraryName),
            format: 'es',
            banner,
            sourcemap: true,
        }
    ],
    external: [],
    watch: {
        include: 'build/src/**',
    },
}