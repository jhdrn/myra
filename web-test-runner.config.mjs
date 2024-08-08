import { esbuildPlugin } from '@web/dev-server-esbuild'

export default {
    concurrency: 10,
    coverage: true,
    nodeResolve: true,
    rootDir: './',
    files: [
        'test/**/*.spec.{ts,tsx}', // include `.spec.ts(x)` files
        // '!**/node_modules/**/*', // exclude `node_modules`
    ],
    plugins: [esbuildPlugin({
        target: 'auto',
        ts: true,
        tsconfig: './tsconfig.json',
        tsx: true,
    })],
}