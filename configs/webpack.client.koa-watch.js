/* eslint-disable */
var webpack = require("webpack");
var config = require("./webpack.client.js");
var path = require("path");

config.cache = true;
config.debug = true;
//config.devtool = "cheap-module-eval-source-map";
config.devtool = "eval";

config.entry.unshift(
	"webpack-hot-middleware/client"
);

config.plugins = [
	new webpack.DefinePlugin({
		__CLIENT__: true,
		__SERVER__: false,
		__PRODUCTION__: false,
		__DEV__: true
	}),
	new webpack.optimize.OccurenceOrderPlugin(),
	new webpack.HotModuleReplacementPlugin(),
	new webpack.NoErrorsPlugin()
];

config.module.postLoaders = [{
	test: /\.js$/,
	loaders: ["babel?cacheDirectory&presets[]=es2015&presets[]=stage-0&presets[]=react&presets[]=react-hmre"],
	exclude: /node_modules/
}];

module.exports = config;