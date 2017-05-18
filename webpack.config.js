const webpack = require('webpack');

module.exports = {
    context: __dirname + "/",
    entry: "./src",
    // devtool: 'eval',
    output: {
        path: __dirname + "/dist",
        filename: "nojquery-qrcode.js",
        libraryTarget: 'umd',
        library: 'qrcode'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin()
    ]
};
