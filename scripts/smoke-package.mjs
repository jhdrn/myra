import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = resolve(import.meta.dirname, '..')
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'myra-package-'))

function run(command, args, cwd = root) {
    const result = spawnSync(command, args, {
        cwd,
        encoding: 'utf8',
        env: { ...process.env, npm_config_cache: join(temporaryDirectory, 'npm-cache') },
        shell: process.platform === 'win32',
    })

    assert.equal(
        result.status,
        0,
        `${command} ${args.join(' ')} failed:\n${result.stdout}${result.stderr}`,
    )
    return result.stdout.trim()
}

async function pack(destination) {
    const output = run('npm', ['pack', './dist', '--json', '--pack-destination', destination])
    const [{ filename, files }] = JSON.parse(output)
    return { filename: join(destination, filename), files: files.map(({ path }) => path).sort() }
}

try {
    const firstPackDirectory = join(temporaryDirectory, 'pack-one')
    const secondPackDirectory = join(temporaryDirectory, 'pack-two')
    await Promise.all([
        mkdir(firstPackDirectory),
        mkdir(secondPackDirectory),
    ])

    const first = await pack(firstPackDirectory)
    const second = await pack(secondPackDirectory)
    assert.deepEqual(first.files, second.files)

    const expectedFiles = [
        'LICENSE',
        'README.md',
        'jsx-runtime.cjs',
        'jsx-runtime.d.ts',
        'jsx-runtime.mjs',
        'jsx-runtime.mjs.map',
        'myra.cjs',
        'myra.d.ts',
        'myra.js',
        'myra.min.js',
        'myra.mjs',
        'myra.mjs.map',
        'package.json',
    ].sort()
    assert.deepEqual(first.files, expectedFiles, 'Published file list changed')

    const hash = async file => createHash('sha256').update(await readFile(file)).digest('hex')
    assert.equal(await hash(first.filename), await hash(second.filename), 'npm pack output is not deterministic')

    const consumer = join(temporaryDirectory, 'consumer')
    await mkdir(consumer)
    await writeFile(join(consumer, 'package.json'), JSON.stringify({ private: true, type: 'module' }))
    run('npm', ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', first.filename], consumer)

    await writeFile(join(consumer, 'esm.mjs'), "import * as myra from 'myra'; import { jsx } from 'myra/jsx-runtime'; if (typeof myra.h !== 'function' || typeof jsx !== 'function') process.exit(1)\n")
    await writeFile(join(consumer, 'commonjs.cjs'), "const myra = require('myra'); const { jsx } = require('myra/jsx-runtime'); if (typeof myra.h !== 'function' || typeof jsx !== 'function') process.exit(1)\n")
    run(process.execPath, ['esm.mjs'], consumer)
    run(process.execPath, ['commonjs.cjs'], consumer)

    await writeFile(join(consumer, 'types.tsx'), "import { h, type VNode } from 'myra'; const node: VNode = <div />; void h; void node\n")
    await writeFile(join(consumer, 'tsconfig.json'), JSON.stringify({ compilerOptions: { strict: true, noEmit: true, module: 'Node16', moduleResolution: 'Node16', jsx: 'react-jsx', jsxImportSource: 'myra' }, files: ['types.tsx'] }))
    run(process.execPath, [resolve(root, 'node_modules/typescript/bin/tsc'), '-p', 'tsconfig.json'], consumer)

    await writeFile(join(consumer, 'browser.js'), "import { h } from 'myra'; globalThis.myraH = h\n")
    await writeFile(join(consumer, 'index.html'), '<script type="module" src="/browser.js"></script>\n')
    run(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), 'build'], consumer)

    console.log(`Validated deterministic ${basename(first.filename)} (${first.files.length} files) in ESM, CommonJS, TypeScript, and a browser bundle.`)
} finally {
    await rm(temporaryDirectory, { recursive: true, force: true })
}
