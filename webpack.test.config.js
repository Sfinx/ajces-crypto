var webpack = require('webpack');
var path = require('path');

var testConfig = {
  name: 'test',
	entry: {
		test: [
			'mocha!./test/index.js'
		],
  },
	externals: [
    'fs'
  ],
  module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /(node_modules|dist)/,
				loader: 'babel-loader'
			}
		]
	},
	resolve: {
		modulesDirectories: ['node_modules']
	},
	devtool: ['inline-source-map'],
	devServer: {
		host: 'localhost',
    port: 8888
	},
	output: {
		publicPath: 'http://localhost:8888/test',
		path: path.join(__dirname, 'test'),
		filename: 'test.bundle.js'
	},
	plugins: [
    new webpack.NoErrorsPlugin()
  ]
};


module.exports = testConfig;
