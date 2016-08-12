var path = require("path");

function absolutePath(dir) {
    return path.resolve(__dirname, dir)
}

module.exports = {
    entry: {
        app: './src/app.ts'
    },
    output: {
        path: absolutePath('build'),
        // publicPath: "/assets/",
        filename: "bundle.js"
    },
    resolve: {
        root: path.resolve(__dirname),
        // Add '.ts' as resolvable extensions.
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".js"]
    },
    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",
  // Add minification
//   plugins: [
//     new webpack.optimize.UglifyJsPlugin()
//   ],
    devServer: {
        historyApiFallback: true
    },
    module: {
        loaders: [
            // All files with a '.ts' extension will be handled by 'ts-loader'.
            { 
                test: /\.ts$/, 
                loader: "ts-loader"
            }
        ],

        preLoaders: [
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { test: /\.js$/, loader: "source-map-loader" }
        ]
    }
}