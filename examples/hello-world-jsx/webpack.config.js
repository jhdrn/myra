var path = require("path");

module.exports = {
    entry: {
        app: './src/app.tsx'
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        publicPath: "/build/",
        filename: "[name].bundle.js"
    },
    resolve: {
        root: path.resolve(__dirname),
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",
    devServer: {
        historyApiFallback: true
    },
    module: {
        loaders: [
            // All files with a '.ts' extension will be handled by 'ts-loader'.
            { 
                test: /\.tsx?$/, 
                loader: "awesome-typescript-loader"
            }
        ],

        preLoaders: [
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { test: /\.js$/, loader: "source-map-loader" }
        ]
    }
}