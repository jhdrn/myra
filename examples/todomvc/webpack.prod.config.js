'use strict';
let webpack = require('webpack');
let path = require('path');

module.exports = {
    entry: {
        app: './src/app.ts'
    },

    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].bundle.js'
    },

    module: {
        rules: [
            { test: /\.tsx?$/, loader: 'awesome-typescript-loader' }
        ]
    },

    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: true
            },
            output: {
                comments: false
            },
            sourceMap: false
        })
    ],

    resolve: {
        modules: [
            "node_modules",
            path.resolve(__dirname, "app")
        ],
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    devtool: false
};