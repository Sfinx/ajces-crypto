var webpack = require('webpack');
var path = require('path');
var libraryName = 'crypto';
var outputFile = libraryName + '.js';
var PROD_ENV = process.env.NODE_ENV === 'production' ? 1 : 0;
var version = JSON.stringify(require('./package.json').version);

var libraryConfig = {
	entry: __dirname + '/src/index.js',
	devtool: PROD_ENV ? [] : ['inline-source-map'],
	output: {
		path: __dirname + '/lib',
		filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
	},
  module: {
		loaders: [
			{
				test: /\.js$/,
        include: path.resolve(__dirname, './src'),
				exclude: /(node_modules|test|dist)/,
				loader: 'babel-loader'
      }
		]
	},
	resolve: {
		root: path.resolve('./src'),
    extensions: ['', '.js']
	},
	plugins: PROD_ENV ? [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.DefinePlugin({'process.env.NODE_ENV': '"production"'}),
		new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin()
  ] : [
		new webpack.DefinePlugin({'process.env.NODE_ENV': '"development"'}),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.NoErrorsPlugin()
	]
};


module.exports = libraryConfig;
