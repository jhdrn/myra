import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'

const libraryName = 'myra'

const banner = '/** @license MIT https://github.com/jhdrn/myra/blob/master/LICENSE - Copyright (c) 2016-2024 Jonathan Hedrén */'

export default {
    input: `src/${libraryName}.ts`,
    plugins: [typescript({ declaration: false, declarationMap: false, sourceMap: true })],
    output: [
        {
            file: `dist/${libraryName}.min.js`,
            name: libraryName,
            format: 'umd',
            banner,
            sourcemap: false,
            plugins: [terser()]
        },
        {
            file: `dist/${libraryName}.js`,
            name: libraryName,
            format: 'umd',
            banner,
            sourcemap: true,
        },
        {
            file: `dist/${libraryName}.mjs`,
            name: libraryName,
            format: 'es',
            banner,
            sourcemap: true,
        }
    ],
    external: [],
    watch: {
        include: 'src/**',
    },
}