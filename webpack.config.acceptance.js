const createWebpackConfig = require('./createWebpackConfig')

module.exports = createWebpackConfig({
  name: 'acceptance',
  devtool: 'cheap-module-source-map',
  lazy: true,
  loadFonts: false,
  acceptance: true,
  cache: true,
})
