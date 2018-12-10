const glob = require('glob');
const path = require('path');
const webpack = require('webpack');

const GasPlugin = require('gas-webpack-plugin');

module.exports = {
  context: __dirname,
  mode: "development",
  devtool: false,
  entry: Object.assign(...glob.sync('./src/*.ts').map(filepath => ({ [path.basename(filepath, '.ts')]: filepath }))),
  output: {
    filename: "[name].js",
  },
  resolve: {
    extensions: [".js", ".ts"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: "ts-loader",
      },
    ],
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new GasPlugin(),
  ],
};
