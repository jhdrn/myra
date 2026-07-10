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
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/**/*.d.ts',
                'src/contract.ts',
                'src/internal.ts',
                'playground/**',
                'playground-dist/**',
                'build/**',
                'dist/**',
                'test/**',
            ],
            reporter: ['text', 'lcov', 'html'],
            reportsDirectory: './coverage',
            thresholds: {
                statements: 97,
                branches: 95,
                functions: 97,
                lines: 97,
            },
        },
    },
})
