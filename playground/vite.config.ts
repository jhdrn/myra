import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'

const srcMyra = fileURLToPath(new URL('../src/myra.ts', import.meta.url))
const outDir = fileURLToPath(new URL('../playground-dist', import.meta.url))

export default defineConfig({
    root: 'playground',
    esbuild: {
        jsx: 'transform',
        jsxFactory: 'myra.h',
        jsxFragment: 'myra.Fragment'
    },
    resolve: {
        alias: {
            myra: srcMyra,
        },
    },
    build: {
        outDir,
        emptyOutDir: true,
    },
})
