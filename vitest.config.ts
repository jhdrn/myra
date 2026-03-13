import { defineConfig } from 'vitest/config'

export default defineConfig({
    esbuild: {
        jsx: 'transform',
        jsxFactory: 'myra.h',
        jsxFragment: 'myra.Fragment',
    },
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['test/**/*.spec.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['lcov', 'html'],
            reportsDirectory: './coverage',
        },
    },
})
