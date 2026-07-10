import { readFile, writeFile } from 'node:fs/promises'

const rootPackage = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))

const jsxRuntimeTypes = `import type { ComponentFactory, Key, MyraNode, VNode } from 'myra'
export { Fragment } from 'myra'

type JSXTag = string | ComponentFactory<object> | undefined | null
interface RuntimeProps {
    children?: MyraNode
    key?: Key
    [name: string]: unknown
}

export declare function jsx(tag: JSXTag, props: RuntimeProps | null, key?: Key): VNode
export declare const jsxs: typeof jsx
export declare function jsxDEV(tag: JSXTag, props: RuntimeProps | null, key?: Key, isStaticChildren?: boolean, source?: unknown, self?: unknown): VNode
`

// Keep this manifest explicit: development-only fields must never leak into the
// package published from dist.
const publishPackage = {
    name: rootPackage.name,
    version: rootPackage.version,
    description: rootPackage.description,
    readme: rootPackage.readme,
    repository: rootPackage.repository,
    keywords: rootPackage.keywords,
    author: rootPackage.author,
    bugs: rootPackage.bugs,
    publishConfig: rootPackage.publishConfig,
    license: rootPackage.license,
    type: rootPackage.type,
    sideEffects: false,
    files: [
        'LICENSE',
        'README.md',
        'myra.cjs',
        'myra.d.ts',
        'myra.js',
        'myra.mjs',
        'myra.mjs.map',
        'myra.min.js',
        'jsx-runtime.cjs',
        'jsx-runtime.d.ts',
        'jsx-runtime.mjs',
        'jsx-runtime.mjs.map',
    ],
    main: './myra.cjs',
    module: './myra.mjs',
    typings: './myra.d.ts',
    exports: rootPackage.exports,
}

await writeFile(
    new URL('../dist/package.json', import.meta.url),
    `${JSON.stringify(publishPackage, null, 2)}\n`,
)
await writeFile(new URL('../dist/jsx-runtime.d.ts', import.meta.url), jsxRuntimeTypes)
