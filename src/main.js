import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { createMikser } from './index'
import { createRouter, createWebHistory } from 'vue-router'

const app = createApp(App)
const pinia = createPinia()
const router = createRouter({
    history: createWebHistory(),
    routes: [{
        path: '/',
        name: 'Home',
        component: () => import('./views/Home.vue'),
    }],
})
const mikser = await createMikser({ 
    router, 
    store: pinia, 
    options: {
        domain: "almero.com",
    }
})

app.use(pinia)
app.use(router)
app.use(mikser)

app.mount('#app')