const vue = require('@vitejs/plugin-vue')
const html = require('vite-plugin-html').createHtmlPlugin
const os = require('os')
const { machineIdSync } = require('node-machine-id')
const path = require('path')

module.exports = (options, domainConfig) => {
    const machineId = machineIdSync() + '_' + os.hostname() + '_' + os.userInfo().username

    return {
        publicDir: 'out',
        define: options.mode == 'development' ? {
            WHITEBOX_DOMAIN: JSON.stringify('almero.com'),
            WHITEBOX_CONTEXT: JSON.stringify(machineId),
        } : {
            WHITEBOX_DOMAIN: JSON.stringify(''),
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
        ],
        build: {
            outDir: 'out',
            sourcemap: options.mode == 'development',
            rollupOptions: {
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