import { useWhiteboxDocuments } from '../stores/documents'
import { useWhiteboxConfig } from "../stores/config"

export default {
    install: (app) => {
        const router = app.config.globalProperties.$router
        
        router.beforeEach((to, from, next) => {
            const configStore = useWhiteboxConfig()
            const documentsStore = useWhiteboxDocuments()

            window.document.documentElement.lang = to.params.lang || window.document.documentElement.lang
            if(!documentsStore.currentRefId) documentsStore.currentRefId = router.currentRoute.refId || decodeURI(router.currentRoute.path)

            let documents = []
            let documentRoute = configStore.documentRoutes[decodeURI(to.path)]
            if (documentRoute) {
                documents.push(to.path)
            }
            let data = []
            for(let matched of to.matched) {
                if (matched.meta.documents) {
                    if (Array.isArray(matched.meta.documents)) {
                        documents.push(...matched.meta.documents)
                    } else {
                        documents.push(matched.meta.documents)
                    }
                }
                if (matched.meta.data) {
                    data.push(matched.meta.data)
                }
                if (matched.meta.refId) {
                    documentRoute = configStore.documentRoutes[matched.meta.refId]
                    documents.unshift(matched.meta.refId)
                }
            }
            documentsStore.load(documents)
            .then(() => {
                if (data.length) {
                    documents = []
                    const document = documentsStore.sitemap[documentRoute.document.meta.lang][documentRoute.href]
                    for(let dataCallback of data) {
                        const dataDocuments = dataCallback({
                            meta: document.data.meta,
                            link: encodeURI(document.refId),
                        })
                        if (Array.isArray(dataDocuments)) {
                            documents.push(...dataDocuments)
                        } else {
                            documents.push(dataDocuments)
                        }
                    }
                    documentsStore.load(documents)
                    .then(() =>	next())
                } else {
                    next()
                }
            })
            .catch(err => next(err))
        })
        
        router.afterEach((to) => {
            documentsStore.currentRefId = router.currentRoute.refId || decodeURI(router.currentRoute.path)

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