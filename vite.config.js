import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: path.resolve(__dirname, '/src/index.js'),
      name: 'VueWhiteboxCore',
      fileName: (format) => `vue-whitebox-core.${format}.js`
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', 'vue-demi', 'pinia'],
      output: {
        exports: 'named',
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          pinia: 'Pinia',
          vue: 'Vue',
          'vue-demi': 'VueDemi'
        }
      }
    },
  },
})
