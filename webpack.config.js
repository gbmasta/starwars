const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
   entry: './src/index.js',
   // loaders
   module: {
      rules: [
         {
            test: /\.html$/i,
            loader: 'html-loader',
         },
         {
            test: /\.(png|jpe?g|gif|svg)$/i,
            use: [
               {
                  loader: 'file-loader',
                  options: {
                     name: '[name].[ext]',
                     outputPath: 'images',
                     publicPath: 'images',
                  }
               },
            ],
         }
      ]
   },
   stats: {
      children: true,
      warningsFilter: [
        /\-\-underline\-color/,
      ]
    },
   // plugins
   plugins: [new HtmlWebpackPlugin({
      template: './src/index.html',
	  favicon: "./src/assets/images/favicon-32x32.png"
   })]
}