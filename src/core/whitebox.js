export default class {
    constructor({ context, shared = '', preloadDocuments = false }) {
        this.context = context
        this.shared = shared
        this.preloadDocuments = preloadDocuments

        if (this.shared) { 
            this.dataContext = [this.context || 'mikser', this.shared]
        } else {
            this.dataContext =  [this.context || 'mikser']
        }

        this.queryContext = this.dataContext.map(context => {
            if (context == 'mikser') return context
            return 'mikser_' + context
        })
    }
    loadSitemap() {       
        return new Promise((resolve, reject) => {
            if (!window.whitebox) return resolve([])
            window.whitebox.init('feed', (feed) => {
                let data = {
                    context: this.dataContext,
                    vault: 'feed',
                    query: { 
                        context: {
                            $in: this.queryContext 
                        }
                    },
                    projection: {
                        'refId': 1,
                        'data.meta.href': 1,
                        'data.meta.route': 1,
                        'data.meta.lang': 1,
                        'data.meta.layout': 1,
                        'data.meta.component': 1,
                    },
                    cache: '1h',
                }
                if (feed.service.catalogs.mikser) {
                    feed.service.catalogs.mikser
                    .find(data)
                    .then((documents) => {
                        for(let document of documents) {
                            document.data.meta.component ||= document.data.meta.layout
                        }
                        console.log('Whitebox sitemap context:', this.dataContext, 'Documents:', documents)
                        resolve(documents)
                    })
                    .catch(reject)
                } else {
                    console.warn('Whitebox sitemap is missing')
                    resolve([])
                }
            })
        })
    }
    loadDocuments(refIds) {
        return new Promise(resolve => {
            if (!window.whitebox) return resolve([])
            window.whitebox.init('feed', (feed) => {      
                if (refIds.length) {
                    const data = {
                        vault: 'feed',
                        cache: '1h',
                        context: this.dataContext,
                        query: {
                            context: { 
                                $in: this.queryContext 
                            },
                            refId: {
                                $in: refIds,
                            },
                        },
                    }
                    feed.service.catalogs.mikser.find(data)
                    .then(documents => {
                        console.log('Whitebox load documents:', refIds, documents)
                        resolve(documents)
                    })
                } else {
                    resolve([])
                }
            })
        })
    }
    loadDocumentsByQuery(query) {
        return new Promise(resolve => {
            if (!window.whitebox) return resolve([])
            window.whitebox.init('feed', (feed) => {
                let data = {}
                if (query.query) {
                    data = query
                } else {
                    data.query = query
                }
                data.context = this.dataContext
                data.query.context = { 
                    $in: this.queryContext 
                }
                data.vault = 'feed'

                feed.service.catalogs.mikser
                .find(data)
                .then(resolve)
            })
        })
    }
    liveReload(callback) {
        if (!window.whitebox) return
        window.whitebox.init('feed', (feed) => {
            window.whitebox.emmiter.on('feed.change', (change) => {
                if (change.type != 'ready') console.log('Feed change:', change)
                else if (change.type == 'initial' || change.type == 'change') {
                    let document = change.new
                    if (!document) return

                    callback(document)
                }
            })
            let data = {
                vault: 'feed', 
                context: callback,
                query: this.queryContext.reduce((query, context) => {
                    if (!query) {
                        return `item("context").eq("${ context }")`
                    }
                    return query += `.or(item("context").eq("${ context }"))`
                }, ''),
                initial: this.preloadDocuments
            }
            feed.service.catalogs.mikser.changes(data)
        })
    }
    getLink(file, options = {}) {
        const { context, cache = true } = options
        return new Promise(resolve => {
            window.whitebox.init('storage', (storage) => {
                if (storage) {
                    let data = {
                        file,
                        cache
                    }
                    if (this.context != 'mikser') {
                        data.context = this.context
                    }
                    if (context) {
                        data.context = context
                    }
                    let result = storage.service.link(data)
                    if (typeof result == 'string') {
                        resolve(result)
                    } else {
                        result.then(link => {
                            resolve(link)
                        })
                    }
                }
            })
        })
    }
    getSharedLink(file) {
        if(!file) return file
        if (file.indexOf('/storage') != 0 && file.indexOf('storage') != 0) {
            if (file[0] == '/') file = '/storage' + file
            else file = '/storage/' + file
        }
        return this.getLink(file, { context: this.shared })
    }
}