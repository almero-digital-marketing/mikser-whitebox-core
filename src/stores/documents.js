import { defineStore } from 'pinia'
import { useWhiteboxRoutes } from "./routes"

let feedPool = {} 

export const useWhiteboxDocuments = defineStore('whitebox-documents', {
    state: () => {
        return {
			sitemap: {},
            currentRefId: '/'
        }
    },
    getters: {
        document() {
            const routesStore = useWhiteboxRoutes()
            let route = routesStore.documentRoutes[this.currentRefId]
            if (!route) return

            let document = this.href(route.href, route.document.meta.lang)
            document.route = route
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

            if (typeof lang == 'boolean') {
                loaded = lang
                lang = undefined
            }
            lang =
                lang ||
                (routesStore.documentRoutes[state.currentRefId] && routesStore.documentRoutes[state.currentRefId].document.meta.lang) ||
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
                    }
                } else {
                    let reverse = routesStore.reverseRoutes[href]
                    if (reverse) {
                        let route = reverse.find((record) => record.document.meta.lang == lang)
                        if (route && !loaded) {
                            return {
                                link: encodeURI(route.refId),
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
                (routesStore.documentRoutes[state.currentRefId] && routesStore.documentRoutes[state.currentRefId].document.meta.lang) ||
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
        updateDocuments(change) {
            if (change.type == 'ready') {
                console.log('Initialization time:', Date.now() - window.startTime + 'ms')
            } else if (change.type == 'initial' || change.type == 'change') {
                let document = change.new
                if (!document) return

                let href = document.data.meta.href || document.data.refId
                let lang = document.data.meta.lang || ''
                
                if (!this.sitemap[lang]) {
                    this.sitemap[lang] = {}
                } 
                else {
                    let oldDocument = this.sitemap[lang][href]
                    if (oldDocument && oldDocument.stamp >= document.stamp) return
                }
                this.sitemap[lang][href] = Object.freeze(document)
            }
        },
        loadDocuments(items) {
            if (!items) items = []
            const result = []
            const routesStore = useWhiteboxRoutes()
             return new Promise(resolve => {
                if (!window.whitebox) return resolve([])
                window.whitebox.init('feed', (feed) => {
                    let loading = []
                    let route = routesStore.documentRoutes[this.currentRefId]
                    let refIds = []
                    for (let item of items) {
                        if (typeof item == 'string') {
                            if (route) {
                                if (routesStore.reverseRoutes[item]) {
                                    let reverseRefIds = routesStore.reverseRoutes[item]
                                    .filter((reverse) => reverse.document.meta.lang == route.document.meta.lang && (!this.sitemap[route.document.meta.lang] || !this.sitemap[route.document.meta.lang][item]))
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
                                let data = {
                                    vault: 'feed',
                                    query: Object.assign(item, {
                                        context: 'mikser',
                                    }),
                                }
                                if (typeof process != 'undefined' && process.env['VUE_APP_WHITEBOX_CONTEXT']) {
                                    data.context = process.env['VUE_APP_WHITEBOX_CONTEXT']
                                    data.query.context = data.query.context + '_' + data.context
                                }
                                loading.push(
                                    feed.service.catalogs.mikser
                                    .find(data)
                                    .then((documents) => {
                                        result.push(...documents)
                                        this.assignDocuments(documents)
                                    })
                                )
                                feedPool[itemId] = Date.now()
                            }
                        }
                    }

                    if (refIds.length) {
                        let data = {
                            vault: 'feed',
                            cache: '1h',
                            query: {
                                context: 'mikser',
                                refId: {
                                    $in: refIds,
                                },
                            },
                        }
                        if (typeof process != 'undefined' && process.env['VUE_APP_WHITEBOX_CONTEXT']) {
                            data.context = process.env['VUE_APP_WHITEBOX_CONTEXT']
                            data.query.context = data.query.context + '_' + data.context
                        }
                        
                        loading.push(
                            feed.service.catalogs.mikser
                            .find(data)
                            .then((documents) => {
                                result.push(...documents)
                                this.assignDocuments(documents)
                            })
                        )
                    }
                    return Promise.all(loading).then(() => resolve(result))
                })
            })
        },
        liveReload(initial) {
            if (!window.whitebox) return
            window.whitebox.init('feed', (feed) => {
                window.whitebox.emmiter.on('feed.change', (change) => {
                    if (change.type != 'ready') console.log('Feed change', change)
                    this.updateDocuments(change)
                })
                let dataContext
                let queryContext = 'mikser'
                if (typeof process != 'undefined' && process.env['VUE_APP_WHITEBOX_CONTEXT']) {
                    dataContext = process.env['VUE_APP_WHITEBOX_CONTEXT']
                    queryContext = queryContext + '_' + dataContext
                }

                feed.service.catalogs.mikser.changes({ 
                    vault: 'feed', 
                    context: dataContext,
                    query: { 
                        context: queryContext
                    },
                    initial
                })
            })
        }
    }
})