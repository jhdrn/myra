'use strict';
let webpack = require('webpack');
let path = require('path');

module.exports = {
    mode: 'production',

    entry: {
        app: './src/app.tsx'
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

    optimization: {
        minimize: true
    },

    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
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