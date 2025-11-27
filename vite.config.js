import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import os from 'os'
import { machineIdSync } from 'node-machine-id'
import path from 'path'

export default defineConfig((options) => {
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
              external: ['vue', 'pinia', 'axios'],
              output: {
                exports: 'named',
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                  pinia: 'Pinia',
                  vue: 'Vue',
                  'axios': 'Axios'
                }
              }
            }
        }
    }
})