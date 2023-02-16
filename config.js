const vue = require('@vitejs/plugin-vue')
const html = require('vite-plugin-html').createHtmlPlugin
const os = require('os')
const { machineIdSync } = require('node-machine-id')
const path = require('path')
const visualizer = require('rollup-plugin-visualizer').visualizer
const fs = require('fs/promises')

module.exports = (options, domainConfig) => {
    const machineId = machineIdSync() + '_' + os.hostname() + '_' + os.userInfo().username

    const constants = options.mode == 'development' ? {
        WHITEBOX_DOMAIN: domainConfig.domain,
        WHITEBOX_CONTEXT: machineId,
        ...options.environment,
    } : {
        WHITEBOX_DOMAIN: domainConfig.domain,
        WHITEBOX_CONTEXT: 'mikser',
        ...options.environment,
    }
    const define = {}
    for(let key in constants) {
        console.log(key + ':', constants[key])
        define[key] = JSON.stringify(constants[key])
    }

    return {
        publicDir: options.mode == 'development' ? '../out' : path.join(options.mikserFolder || '../mikser', 'files'),
        define,
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
                    server.httpServer?.once('listening', () => {
                        setTimeout(() => {
                            console.log('  🌐 Public: ',`https://${server.config.server.port}-${os.hostname().split('.')[0]}.dev.whitebox.pro/\n`);
                        }, 100)
                    })
                }
            }
        ],
        build: {
            outDir: '../out',
            sourcemap: options.mode == 'development',
            rollupOptions: {
                plugins: [
                    visualizer((opts) => {
                        return { 
                            filename: 'runtime/stats.html' 
                        }
                    }),
                    {
                        name: 'layout-template',
                        writeBundle: (options) => {
                            return fs.rename(path.join(options.dir, 'index.html'), path.join(options.dir, 'template.html'))
                        }
                    }
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