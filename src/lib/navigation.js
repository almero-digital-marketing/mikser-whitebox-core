import { useWhiteboxDocuments } from '../stores/documents'
import { useWhiteboxRoutes } from "../stores/routes"
import { useWhiteboxTracking } from '../stores/tracking'

export default {
    install: (app) => {
        const router = app.config.globalProperties.$router
        
        router.beforeEach((to, from, next) => {
            const routesStore = useWhiteboxRoutes()
            const documentsStore = useWhiteboxDocuments()
            
            let documents = []
            const toRefId = decodeURI(to.path)
            let documentRoute = routesStore.documentRoutes[toRefId]
            if (documentRoute) {
                documents.push(to.path)
            }
            for(let matched of to.matched) {
                if (matched.meta.documents) {
                    if (Array.isArray(matched.meta.documents)) {
                        documents.push(...matched.meta.documents)
                    } else {
                        documents.push(matched.meta.documents)
                    }
                }
                
                if (matched.meta.refId) {
                    documentRoute = routesStore.documentRoutes[matched.meta.refId]
                    documents.unshift(matched.meta.refId)
                }
            }
            
            documentsStore.loadDocuments(documents)
            .then(() => {
                next()
            })
            .catch(err => next(err))
        })
        
        router.afterEach((to, from) => {
            const routesStore = useWhiteboxRoutes()
            routesStore.currentRefId = router.currentRoute.value.refId || decodeURI(router.currentRoute.value.path)
            routesStore.loadRoute(router.currentRoute.value.refId || decodeURI(router.currentRoute.value.path)).catch(console.error)

            if (from.path != to.path) {
                const trackingStore = useWhiteboxTracking()
                setTimeout(() => {
                    trackingStore.pageView(to.path)
                }, 100)
            }
        })
    }
}