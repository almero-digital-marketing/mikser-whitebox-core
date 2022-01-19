import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { createMikser } from './lib/mikser'
import { createRouter, createWebHistory } from 'vue-router'

;(async () => {
    const app = createApp(App)
    app.use(createPinia())
    
    const router = createRouter({
        history: createWebHistory(),
        routes: [{
            path: '/',
            name: 'Home',
            component: () => import('./views/Home.vue'),
        }],
    })
    app.use(router)
    
    try {
        const mikser = createMikser()
        app.use(mikser)
        await mikser.init()
    } catch(e) {
        console.log(e)
    }
    app.mount('#app')
})()