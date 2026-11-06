import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'

const srcMyra = fileURLToPath(new URL('../src/myra.ts', import.meta.url))
const outDir = fileURLToPath(new URL('../playground-dist', import.meta.url))

export default defineConfig({
    root: 'playground',
    oxc: {
        jsx: {
            runtime: 'classic',
            pragma: 'myra.h',
            pragmaFrag: 'myra.Fragment',
        },
    },
    resolve: {
        alias: {
            myra: srcMyra,
        },
    },
    base: '/myra/',
    build: {
        outDir,
        emptyOutDir: true,
    },
})
