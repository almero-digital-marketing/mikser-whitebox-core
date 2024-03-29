const vue = require('@vitejs/plugin-vue')
const html = require('vite-plugin-html').createHtmlPlugin
const os = require('os')
const { machineIdSync } = require('node-machine-id')
const path = require('path')

module.exports = (options, domainConfig) => {
    const machineId = machineIdSync() + '_' + os.hostname() + '_' + os.userInfo().username

    console.log(options.mode)
    return {
        publicDir: 'out',
        define: options.mode == 'development' ? {
            WHITEBOX_DOMAIN: JSON.stringify('gpoint.bg'),
            WHITEBOX_CONTEXT: JSON.stringify(machineId),
        } : {
            WHITEBOX_DOMAIN: JSON.stringify('web'),
            WHITEBOX_CONTEXT: JSON.stringify('mikser'),
        },
        plugins: [
            vue(),
            html({
                inject: {
                    data: {
                        domainConfig
                    },
                },
                minify: true,
            }),
            {
                name: 'gate',
                configureServer(server) {
                    server.httpServer?.once('listening',() => {
                        setTimeout(() => {
                            console.log('  > Public:  ',`https://${server.config.server.port}-${os.hostname().split('.')[0]}.dev.whitebox.pro/\n`);
                        }, 100)
                    })
                }
            }
        ],
        build: {
            lib: {
              entry: path.resolve(__dirname, '/src/index.js'),
              name: 'VueWhiteboxCore',
              fileName: (format) => `vue-whitebox-core.${format}.js`
            },
            rollupOptions: {
              // make sure to externalize deps that shouldn't be bundled
              // into your library
              external: ['vue', 'vue-demi', 'pinia', 'axios'],
              output: {
                exports: 'named',
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                  pinia: 'Pinia',
                  vue: 'Vue',
                  'vue-demi': 'VueDemi',
                  'axios': 'Axios'
                }
              }
            }
        }
    }
} 