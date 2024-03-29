import { defineStore } from 'pinia'
import Core from "../core"

function normalizeDocument(document) {
    document.meta = document.feed[Object.keys(document.feed)[0]].meta
    delete document.feed
    return document
}

export const useWhiteboxSearches = defineStore('whitebox-searches', {
    state: () => {
        return {
            searchMap: {}
        }
    },
    getters: {
        hits: (state) => (name) => {
            return state.searchMap[name]
        }
    },
    actions: {
        match(name, query, options) {
            return this.search(name, {
                must: {
                    match: query
                }
            }, options)
        },
        multiMatch(name, query, options) {
            return this.search(name, {
                must: {
                    multi_match: query
                }
            }, options)
        },
        combinedFields(name, query, options) {
            return this.search(name, {
                must: {
                    combined_fields: query
                }
            }, options)
        },
        queryString(name, query, options) {
            return this.search(name, {
                must: {
                    query_string: query
                }
            }, options)
        },
        search(name, query, options = {}) {
            return new Promise(resolve => {
                this.searchMap[name] = []
                this.searchMap[name].loaded = false
                if (!window.whitebox) return resolve([])
                window.whitebox.init('feed', (feed) => {
                    let data = {
                        context: Core.dataSource.dataContext,
                        vault: 'feed',
                        query: {
                            bool: {
                                filter: {                               
                                    terms: { 
                                        'context.keyword': Core.dataSource.queryContext 
                                    } 
                                },
                                ...query,
                            }
                        },
                        ...options
                    }

                    feed.service.catalogs.mikser
                    .search(data)
                    .then((documents) => {
                        this.searchMap[name] = documents.map(normalizeDocument)
                        this.searchMap[name].loaded = true
                        resolve(documents)
                    })
                    .catch(error => {
                        this.searchMap[name].error = error
                    })
                })
            })
        }
    }
})