import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { createMikser } from './index'
import { createRouter, createWebHistory } from 'vue-router'

async function main() {
    const app = createApp(App)
    const pinia = createPinia()
    const router = createRouter({
        history: createWebHistory(),
        routes: [{
            path: '/',
            name: 'Home',
            component: () => import('./views/Home.vue'),
            meta: {
                collections: {
                    items: document => ({
                        query: {
                            'data.meta.layout': 'Home',
                            'data.meta.lang': document.meta.lang
                        }
                    }),
                }
            }
        }, {
            path: '/projects',
            name: 'Projects',
            component: () => import('./views/Projects.vue'),
            meta: {
                collections: {
                    items: document => ({
                        'data.meta.layout': 'Project',
                        'data.meta.lang': document.meta.lang
                    }),
                }
            },
        }],
    })
    const mikser = await createMikser({ 
        router, 
        store: pinia, 
        options: {
            domain: "almero.com",
            "gtag": "G-JPF7CWHSXQ",
            "fbq": "616081495752346",        
            context: WHITEBOX_CONTEXT
        }
    })
    
    app.use(pinia)
    app.use(router)
    app.use(mikser)
    
    app.mount('#app')
}
main()