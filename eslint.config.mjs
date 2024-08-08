// @ts-check

import eslint from '@eslint/js'
import stylisticJs from '@stylistic/eslint-plugin-js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: [
            'node_modules/',
            'build/',
            'dist/'
        ],
        plugins: {
            '@stylistic/js': stylisticJs
        },
        rules: {
            "@typescript-eslint/no-namespace": "off",
            "@typescript-eslint/no-unused-expressions": "off",
            "@stylistic/js/quotes": ["error", "single"],
            "@stylistic/js/semi": ["error", "never"],
        }
    }
)