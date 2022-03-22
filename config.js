const vue = require('@vitejs/plugin-vue')
const html = require('vite-plugin-html').createHtmlPlugin
const environment = require('vite-plugin-environment').default
const os = require('os')
const { machineIdSync } = require('node-machine-id')
const path = require('path')

module.exports = (options, domainConfig) => {
    const machineId = machineIdSync() + '_' + os.hostname() + '_' + os.userInfo().username

    return {
        publicDir: 'out',
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
            environment(options.mode == 'development' ? {
                VUE_APP_WHITEBOX_DOMAIN: domainConfig.domain,
                VUE_APP_WHITEBOX_CONTEXT: machineId
            } : {
                VUE_APP_WHITEBOX_DOMAIN: domainConfig.domain,
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