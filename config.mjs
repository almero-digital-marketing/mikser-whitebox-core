import vue from '@vitejs/plugin-vue'
import mikser from 'vite-plugin-mikser'
import { createHtmlPlugin as html } from 'vite-plugin-html'
import os from 'os'
import MID from 'node-machine-id'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default (options, domainConfig) => {
    const machineId = MID.machineIdSync() + '_' + os.hostname() + '_' + os.userInfo().username

    const constants = options.mode == 'development' ? {
        WHITEBOX_DOMAIN: domainConfig.domain,
        WHITEBOX_CONTEXT: machineId,
        ...options.environment,
    } : {
        WHITEBOX_CONTEXT: 'web',
        WHITEBOX_DOMAIN: domainConfig.domain,
        ...options.environment,
    }
    const define = {}
    for(let key in constants) {
        console.log(key + ':', constants[key])
        define[key] = JSON.stringify(constants[key])
    }

    return {
        define,
        plugins: [
            mikser(),
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
                    server.httpServer?.once('listening', () => {
                        setTimeout(() => {
                            console.log('  🌐 Public: ',`https://${server.config.server.port}-${os.hostname().split('.')[0]}.dev.whitebox.pro/\n`);
                        }, 100)
                    })
                }
            }
        ],
        build: {
            sourcemap: options.mode == 'development',
            rollupOptions: {
                plugins: [
                    visualizer((opts) => {
                        return { 
                            filename: 'runtime/stats.html' 
                        }
                    })
                ],
                output: {
                    manualChunks: id => {
                        if (id.includes('node_modules')) {
                            let moduleName = id.split(path.sep).slice(id.split(path.sep).indexOf('node_modules') + 1)[0]
                            for(let key in options.vendorChunks) {
                                if (options.vendorChunks[key].indexOf(moduleName) > -1) return 'vendor-' + key
                            }
                            if (moduleName.includes('whitebox')) {
                                return 'vendor-whitebox';
                            } else if (moduleName.includes('vue')) {
                                return 'vendor-vue';
                            }
                            return 'vendor';
                        }
                    }
                },
            },
        }
    }
} 