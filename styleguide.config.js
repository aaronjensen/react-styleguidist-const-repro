const path = require('path')
const createWebpackConfig = require('./createWebpackConfig')

let configName = 'styleguide'
let useHardSource = false

if (process.argv.includes('server')) {
  // Use different cache for server
  configName = 'styleguide-server'

  useHardSource = true

  // Exit on end of STDIN
  process.stdin.resume()
  process.stdin.on('end', () => process.exit(0))
}

module.exports = {
  title: 'Linked Learning Certification Styles',
  styleguideDir: './priv/static/styleguide',
  contextDependencies: [
    path.resolve(__dirname, 'client/app/components'),
    path.resolve(__dirname, 'client/app/sections'),
  ],
  sections: [
    {
      name: 'General',
      sections: [
        {
          name: 'Particles',
          components: './client/app/components/particles/**/*.js',
        },
        {
          name: 'Atoms',
          components: './client/app/components/atoms/**/*.js',
        },
        {
          name: 'Molecules',
          components: './client/app/components/molecules/**/*.js',
        },
        {
          name: 'Organisms',
          components: './client/app/components/organisms/**/*.js',
        },
        {
          name: 'Templates',
          components: './client/app/components/templates/**/*.js',
        },
      ],
    },
    {
      name: 'Sections',
      sections: [
        {
          name: 'Create Pathway',
          components: './client/app/sections/CreatePathway/**/*.js',
        },
        {
          name: 'Certification Requirements',
          components: './client/app/sections/CertificationRequirements/**/*.js',
        },
        {
          name: 'Footer',
          components: './client/app/sections/Footer/**/*.js',
        },
        {
          name: 'Header',
          components: './client/app/sections/Header/**/*.js',
        },
        {
          name: 'Pathway Progress',
          components: './client/app/sections/PathwayProgress/**/*.js',
        },
        {
          name: 'Pathway Requirement',
          components: './client/app/sections/PathwayRequirement/**/*.js',
        },
      ],
    },
  ],

  skipComponentsWithoutExample: true,

  getExampleFilename(componentPath) {
    return componentPath.replace(/\.js$/, '.examples.md')
  },

  getComponentPathLine(componentPath) {
    const name = path.basename(componentPath, '.js')
    const dir = path.dirname(componentPath.replace(/^client\/app/, ''))

    return `import ${name} from 'app${dir}/${name}'`
  },

  webpackConfig: createWebpackConfig({
    name: configName,
    // devtool: 'eval-source-map',
    styleguide: true,
    loadFonts: true,
    cache: useHardSource,
  }),
}
