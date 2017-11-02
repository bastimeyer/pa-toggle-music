const { resolve: r } = require( "path" );
const UglifyJSPlugin = require( "uglifyjs-webpack-plugin" );
const webpack = require( "webpack" );
const {
	name,
	homepage,
	author,
	license
} = require( "./package.json" );


module.exports = {
	target: "node",
	entry: r( ".", "src", "index.js" ),
	output: {
		path: process.env.PREFIX
			? r( process.env.PREFIX )
			: r( ".", "dist" ),
		filename: name
	},
	plugins: [
		new UglifyJSPlugin({
			test: /./,
			uglifyOptions: {
				ecma: 6,
				mangle: true,
				compress: true,
				output: {
					beautify: false
				}
			}
		}),
		new webpack.BannerPlugin({
			banner: `${name}\n@homepage ${homepage}\n@author ${author}\n@license ${license}`
		}),
		new webpack.BannerPlugin({
			banner: "#!/usr/bin/env node",
			raw: true
		})
	]
};
