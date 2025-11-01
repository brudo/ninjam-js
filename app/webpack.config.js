const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    entry: "./src/entry.jsx",
    devtool: "source-map",
    output: {
      path: path.join(__dirname, "build"),
      filename: "js/bundle.js"
    },
    module: {
      rules: [{
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env']
          }
        }
      }, {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }]
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json']
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'build')
      },
      hot: true,
      host: '0.0.0.0'
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: 'static' }
        ]
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development')
      })
    ]
  };
};
