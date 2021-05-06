import {
    minify
} from 'uglify-es'
// import sourceMaps from 'rollup-plugin-sourcemaps'
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
                exclude: /^component|helpers/,
                externals: true
            })
    }
}

// const pkg = require('./package.json')

const libraryName = 'myra'

export default {
    input: `build/src/${libraryName}.js`,
    output: [{
        file: `dist/${libraryName}.min.js`,
        name: camelCase(libraryName),
        format: 'umd',
        banner: '/** @license MIT https://github.com/jhdrn/myra/blob/master/LICENSE - Copyright (c) 2016-2021 Jonathan Hedrén */',
        sourcemap: false,
    }],
    external: [],
    watch: {
        include: 'build/src/**',
    },
    plugins: [

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