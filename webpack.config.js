const AwsSamPlugin = require('./customWebpackSamPlugin');
const awsSamPlugin = new AwsSamPlugin();

module.exports = {
  entry: awsSamPlugin.entry(),
  output: {
    filename: '[name]/app.js',
    libraryTarget: 'commonjs2',
    path: __dirname + '/.aws-sam/build/'
  },
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['.ts', '.js']
  },
  target: 'node',
  mode: process.env.NODE_ENV || 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      }
    ]
  },
  plugins: [awsSamPlugin]
};
