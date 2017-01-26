const createWebpackConfig = require('./createWebpackConfig')

module.exports = createWebpackConfig({
  name: 'dev',
  devtool: 'eval-source-map',
  hot: true,
  cache: true,
})
