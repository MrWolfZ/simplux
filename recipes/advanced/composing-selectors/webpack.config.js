const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  devtool: 'inline-source-map',
  entry: './src/index.ts',
  plugins: [new HtmlWebpackPlugin({ template: './index.html' })],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [
      {
        apply(resolver) {
          resolver.getHook('raw-file').tapAsync('ESM resolver', (request, _, callback) => {
            const adjustedReq = {
              ...request,
              path: request.path?.replace(/\.js(x)?$/, '.ts$1'),
              relativePath: request.relativePath?.replace(/\.js(x)?$/, '.ts$1'),
            }

            if (request.path === adjustedReq.path) {
              return callback()
            }

            resolver.doResolve(resolver.ensureHook('file'), adjustedReq, 'ESM resolver', callback)
          })
        },
      },
    ],
  },
}
