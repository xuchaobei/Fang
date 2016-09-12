var webpack = require("webpack");
var path = require("path");

module.exports = {
	target: "web",
	//cache: false,
	context: __dirname,
	//debug: false,
	//devtool: false,
	entry: ["../frontend/entry"],
	output: {
		path: path.join(__dirname, "../static"),
		filename: "bundle.js",
		//chunkFilename: "[name].[id].js"
	},
	plugins: [
		new webpack.DefinePlugin({
			__CLIENT__: true,
			__SERVER__: false,
			__PRODUCTION__: true,
			__DEV__: false
		}),
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: '"production"'
			}
		}),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		})
	],
	module: {
		loaders: [{
			test: /\.json$/,
			loaders: ["json"]
		}, {
			test: /\.(ico|gif|png|jpg|jpeg|svg|webp)$/,
			loaders: ["file?context=static&name=/[path][name].[ext]"],
			exclude: /node_modules/
		}, {
			test: /\.css$/,
			loader: "style!css"
		}, {
			test: /\.less$/,
			loader: 'style!css!less'
		}, {
			test: /\.scss$/,
			loader: "style!css!sass"
		}],
		postLoaders: [{
			test: /\.js$/,
			loaders: ["babel?presets[]=es2015&presets[]=stage-0&presets[]=react"],
			exclude: /node_modules/
		}],
		noParse: /\.min\.js/
	},
	resolve: {
		alias: {
			'normalize.css': path.join(__dirname, '../node_modules/normalize.css')
		}
	}
};