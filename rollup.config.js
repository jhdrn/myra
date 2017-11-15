import typescript from 'rollup-plugin-typescript2';
import uglify from 'rollup-plugin-uglify';

export default {
    entry: './src/index.ts',
    format: 'umd',
    dest: 'dist/myra.js',
    name: 'myra',
    plugins: [
        typescript(),
        uglify()
    ]
}