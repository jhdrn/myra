'use strict';
let webpack = require('webpack');
let path = require('path');

module.exports = {
    entry: {
        app: './src/app.tsx'
    },

    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].bundle.js'
    },

    module: {
        loaders: [
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
        root: path.resolve(__dirname),
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    devtool: false
};