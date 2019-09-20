import {
    minify
} from 'uglify-es'
import {
    uglify
} from 'rollup-plugin-uglify'
import camelCase from 'lodash.camelcase'
import dts from 'dts-bundle'

function dtsBundle(libraryName) {
    return {
        name: 'dtsBundle',
        writeBundle: () =>
            dts.bundle({
                name: libraryName,
                main: `build/src/${libraryName}.d.ts`,
                out: `../../dist/${libraryName}.d.ts`,
                removeSource: false,
                outputAsModuleFolder: true,
                exclude: /^component|helpers|renderer/,
                externals: true
            })
    }
}

const pkg = require('./package.json')

const libraryName = 'myra'

export default {
    input: `build/src/${libraryName}.js`,
    output: [{
        file: `dist/${libraryName}.min.js`,
        name: camelCase(libraryName),
        format: 'umd',
        banner: '/** @license MIT https://github.com/jhdrn/myra/blob/master/LICENSE - Copyright (c) 2017-2018 Jonathan Hedrén */',
        sourcemap: false,
    }],
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: [],
    watch: {
        include: 'build/src/**',
    },
    plugins: [
        // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
        // commonjs(),
        // Allow node_modules resolution, so you can use 'external' to control
        // which external modules to include in the bundle
        // https://github.com/rollup/rollup-plugin-node-resolve#usage
        // resolve(),

        // Minify 
        process.env.BUILD === 'production' && uglify({}, function (code) {
            return minify(code, {
                output: {
                    comments: 'some'
                }
            })
        }),

        // Resolve source maps to the original source
        // sourceMaps(),

        // Create a d.ts bundle
        dtsBundle(libraryName)

    ],
}