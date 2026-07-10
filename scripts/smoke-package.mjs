import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'

const artifacts = [
    'dist/myra.cjs',
    'dist/myra.d.ts',
    'dist/myra.js',
    'dist/myra.mjs',
    'dist/myra.min.js',
    'dist/package.json',
]

for (const artifact of artifacts) {
    assert.ok(existsSync(artifact), `Missing package artifact: ${artifact}`)
}

const esm = await import('../dist/myra.mjs')
const require = createRequire(import.meta.url)
const commonjs = require('../dist/myra.cjs')

for (const module of [esm, commonjs]) {
    assert.equal(typeof module.h, 'function')
    assert.equal(typeof module.mount, 'function')
}

assert.deepEqual(Object.keys(commonjs).sort(), Object.keys(esm).sort())
