import { defineStore } from 'pinia'
import { useWhiteboxRoutes } from "./routes"
import Core from "../core"
import { ref } from 'vue'

let feedPool = {} 

export const useWhiteboxDocuments = defineStore('whitebox-documents', {
    state: () => {
        return {
			sitemap: {},
            context: {}
        }
    },
    getters: {
        document() {
            const routesStore = useWhiteboxRoutes()
            if (!routesStore.documentRoute) return

            let document = this.href(routesStore.documentRoute.href, routesStore.documentRoute.document.meta.lang)
            document.documentRoute = routesStore.documentRoute
            return document	
        },
        alternates: (state) => (href) => {
            let documents = []
            for (let lang of state.sitemap) {
                let document = state.sitemap[lang][href]
                if (document) documents.push(document)
            }
            return documents
        },
        href: (state) => (href, lang, loaded) => {
            const routesStore = useWhiteboxRoutes()
            let hash = (href || '').split(/(?=[<#])/)[1]
            href = (href || '').split('#')[0]

            if (typeof lang == 'boolean') {
                loaded = lang
                lang = undefined
            }
            lang =
                lang ||
                (routesStore.documentRoute && routesStore.documentRoute.document.meta.lang) ||
                document.documentElement.lang ||
                ''

            let hreflang = state.sitemap[lang]

            if (hreflang) {
                let document = hreflang[href]
                if (document) {
                    return {
                        loaded: true,
                        meta: document.data.meta,
                        link: encodeURI(document.refId),
                        content: document.data.content,
                        location: {
                            path: encodeURI(document.refId),
                            hash
                        }
                    }
                } else {
                    let reverse = routesStore.reverseRoutes[href]
                    if (reverse) {
                        let route = reverse.find((record) => record.document.meta.lang == lang)
                        if (route && !loaded) {
                            return {
                                link: encodeURI(route.refId),
                                location: {
                                    path: encodeURI(route.refId),
                                    hash
                                },
                                meta: {},
                            }	
                        }
                    }
                }
            }
            if (loaded) return
            return {
                meta: {},
                link: encodeURI('/' + lang + href),
            }
        },
        hrefs: (state) => (regex, lang, loaded) => {
            const routesStore = useWhiteboxRoutes()

            if (typeof lang == 'boolean') {
                loaded = lang
                lang = undefined
            }
            if (typeof regex == 'string') {
                regex = new RegExp(regex)
            }
            lang =
                lang ||
                (routesStore.documentRoute && routesStore.documentRoute.document.meta.lang) ||
                document.documentElement.lang ||
                ''
            let hreflang = state.sitemap[lang]
            if (hreflang) {
                const documents = Object.keys(routesStore.reverseRoutes)
                    .filter((href) => regex.test(href))
                    .map((href) => {
                        let document = hreflang[href]
                        if (document) {
                            return {
                                loaded: true,
                                meta: document.data.meta,
                                link: encodeURI(document.refId),
                            }
                        } else {
                            let reverse = routesStore.reverseRoutes[href]
                            let route = reverse.find((record) => record.document.meta.lang == lang)
                            if (route) {
                                return {
                                    link: encodeURI(route.refId),
                                    meta: {},
                                }
                            }
                        }
                    })
                    .filter(document => document)
                if (loaded) {
                    if (!documents.find(document => !document.loaded)) return documents
                    else []
                } 
                return documents
            }
            return []
        },
    },
    actions: {
        updateDocument(document) {
            let href = document.data.meta.href || document.refId
            let lang = document.data.meta.lang || ''
            
            if (!this.sitemap[lang]) {
                this.sitemap[lang] = {}
            } 
            else {
                let oldDocument = this.sitemap[lang][href]
                if (oldDocument && oldDocument.stamp >= document.stamp) return
            }
            this.sitemap[lang][href] = Object.freeze(document)
        },
        assignDocuments(documents) {
            this.$patch(state => {
                for (let document of documents) {
                    let href = document.data.meta.href || document.data.refId
                    let lang = document.data.meta.lang || ''
                    if (!state.sitemap[lang]) state.sitemap[lang] = {}
                    const currentDocument = state.sitemap[lang][href]
                    if (!currentDocument || currentDocument.stamp != document.stamp) {
                        state.sitemap[lang][href] = Object.freeze(document)
                    }
                }
            })
            console.log('Load time:', Date.now() - window.startTime + 'ms')
        },
        loadDocuments(items) {
            if (!items) items = []
            const result = []
            const routesStore = useWhiteboxRoutes()
            let loading = []
            let refIds = []
            for (let item of items) {
                if (typeof item == 'string') {
                    if (routesStore.documentRoute) {
                        if (routesStore.reverseRoutes[item]) {
                            let reverseRefIds = routesStore.reverseRoutes[item]
                            .filter((reverse) => 
                                reverse.document.meta.lang == routesStore.documentRoute.document.meta.lang && 
                                (
                                    !this.sitemap[routesStore.documentRoute.document.meta.lang] || 
                                    !this.sitemap[routesStore.documentRoute.document.meta.lang][item]
                                )
                            )
                            .map((reverse) => reverse.refId)
                            .filter((refId) => feedPool[refId] == undefined)
                            
                            refIds.push(
                                ...reverseRefIds
                            )
                            reverseRefIds.forEach(refId => feedPool[refId] = Date.now())
                        } else {
                            let documentRefId = decodeURI(item)
                            
                            if (feedPool[documentRefId] == undefined ) {
                                let documentRoute = routesStore.documentRoutes[documentRefId]
                                if (documentRoute && !this.href(documentRoute.href, documentRoute.document.meta.lang, true)) {
                                    refIds.push(documentRefId)
                                    feedPool[documentRefId] = Date.now()
                                }
                            }
                        }
                    }
                } else {
                    const itemId = JSON.stringify(item)
                    if (feedPool[itemId] == undefined ) {
                        feedPool[itemId] = []                              
                        loading.push(
                            Core.dataSource.loadDocumentsByQuery(item)
                            .then((documents) => {
                                feedPool[itemId].push(...documents)
                                result.push(...feedPool[itemId])
                                this.assignDocuments(documents)
                            })
                        )
                    } else {
                        result.push(...feedPool[itemId])
                    }
                }
            }

            loading.push(
                Core.dataSource.loadDocuments(refIds)
                .then((documents) => {
                    result.push(...documents)
                    this.assignDocuments(documents)
                })
            )
            return Promise.all(loading).then(() => result)
        },
        loadContext() {
            const routesStore = useWhiteboxRoutes()
            return Core.dataSource.loadContext(routesStore.currentRefId)
            .then(context => this.context = context)
        }
    },
})