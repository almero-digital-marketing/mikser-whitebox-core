import { useWhiteboxDocuments } from '../stores/documents'
import { useWhiteboxRoutes } from "../stores/routes"

export default {
    install: (app) => {
        const router = app.config.globalProperties.$router
        
        router.beforeEach((to, from, next) => {
            const routesStore = useWhiteboxRoutes()
            const documentsStore = useWhiteboxDocuments()

            window.document.documentElement.lang = to.params.lang || window.document.documentElement.lang

            let documents = []
            let toRefId = decodeURI(to.path)
            let documentRoute = routesStore.documentRoutes[toRefId]
            if (documentRoute) {
                documents.push(to.path)
            }
            const collections = {}
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
                Object.assign(collections, matched.meta.collections)
            }
            
            documentsStore.loadDocuments(documents)
            .then(() => next())
            .catch(err => next(err))
        })
        
        router.afterEach((to) => {
            const routesStore = useWhiteboxRoutes()
            routesStore.currentRefId = router.currentRoute.value.refId || decodeURI(router.currentRoute.value.path)

            const collections = {}
            for(let matched of to.matched) {
                Object.assign(collections, matched.meta.collections)
            }
            routesStore.loadCollections(collections).catch(console.error)

            if (!window.whitebox) return
            window.whitebox.init('analytics', analytics => {
                if (analytics) {
                    setTimeout(() => {
                        console.log('Track route:', decodeURI(to.path))
                        analytics.service.info()
                    }, 100)
                }
            })
        })
    }
}