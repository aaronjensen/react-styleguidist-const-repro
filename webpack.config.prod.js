const createWebpackConfig = require('./createWebpackConfig')

module.exports = createWebpackConfig({
  name: 'prod',
  devtool: 'source-map',
  minimize: true,
  digest: !process.env.CI,
  cache: false,
  // To analyze bundle size, uncomment and then run `npm run build:webpack`
  // analyze: true,
})
