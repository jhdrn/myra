var path = require("path");

module.exports = {
    entry: {
        app: './src/app.ts'
    },
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "bundle.js"
    },
    resolve: {
        root: __dirname,
        // Add '.ts' as resolvable extensions.
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".js"]
    },
    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",
    module: {
        loaders: [
            // All files with a '.ts' extension will be handled by 'ts-loader'.
            { 
                test: /\.ts$/, 
                loader: "awesome-typescript-loader"
            }
        ],

        preLoaders: [
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { test: /\.js$/, loader: "source-map-loader" }
        ]
    }
};