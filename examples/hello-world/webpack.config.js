var path = require("path");
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        app: './src/app.ts'
    },
    output: {
        path: path.resolve(__dirname, "build"),
        // publicPath: "/assets/",
        filename: "bundle.js"
    },
    resolve: {
        root: __dirname,
        // Add '.ts' as resolvable extensions.
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".js"]
    },
    // resolveLoader: {
    //     root: path.join(__dirname, "node_modules")
    //     // modulesDirectories: ["node_modules"]
    // },
    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",
  // Add minification
//   plugins: [
//     new webpack.optimize.UglifyJsPlugin()
//   ],
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
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    // externals: {
    //     "react": "React",
    //     "react-dom": "ReactDOM"
    // },
};