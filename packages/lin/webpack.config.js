/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires,  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
const path = require('path')

module.exports = {
    mode: 'production',
    target: 'node',
    entry: './src/index.ts',
    output: {
        library: {
            type: 'commonjs',
        },
        filename: 'index.js',
        path: path.resolve(__dirname, 'out'),
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loader: 'ts-loader' }
        ]
    },
}
