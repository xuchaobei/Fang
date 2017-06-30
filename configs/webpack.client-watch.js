/* eslint-disable */
var webpack = require("webpack");
var config = require("./webpack.client.js");
var path = require("path");

var wds = {
	hostname: process.env.HOSTNAME || "localhost",
	port: 3000
};

config.cache = true;
config.debug = true;
//config.devtool = "cheap-module-eval-source-map";
config.devtool = "eval";

config.entry.unshift(
	"webpack-dev-server/client?http://" + wds.hostname + ":" + wds.port,
	"webpack/hot/only-dev-server"
);

config.devServer = {
	contentBase: path.join(__dirname, "../static"),
	hot: true,
	inline: true,
	lazy: false,
	quiet: true,
	noInfo: true,
	headers: {
		"Access-Control-Allow-Origin": "*"
	},
	stats: {
		colors: true
	},
	host: wds.hostname
};

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