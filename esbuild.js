import * as esbuild from 'esbuild'

const commonOptions = {
    banner: {
        js: "/** @license MIT https://github.com/jhdrn/myra/blob/master/LICENSE - Copyright (c) 2016-2023 Jonathan Hedrén */"
    },
    bundle: true,
    entryPoints: ["src/myra.ts"],
    target: 'es2019',
}

Promise.all([
    esbuild.build({
        ...commonOptions,
        format: 'iife',
        globalName: 'myra',
        minify: false,
        outfile: './dist/myra.js',
        sourcemap: true
    }),
    esbuild.build({
        ...commonOptions,
        format: 'iife',
        globalName: 'myra',
        minify: true,
        outfile: './dist/myra.min.js',
    }),

    esbuild.build({
        ...commonOptions,
        format: 'esm',
        minify: false,
        outfile: './dist/myra.es.js',
        sourcemap: true
    }),
    esbuild.build({
        ...commonOptions,
        format: 'esm',
        minify: true,
        outfile: './dist/myra.es.min.js',
    }),
])
    .then(() => console.log("⚡ Build complete! ⚡"))
    .catch(() => process.exit(1))

