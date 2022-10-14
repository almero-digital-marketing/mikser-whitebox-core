import { defineStore } from 'pinia'
import { useWhitebox } from "../stores/whitebox"

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
            return this.search(name, [{
                match: query
            }], options)
        },
        multiMatch(name, query, options) {
            return this.search(name, [{
                multi_match: query
            }], options)
        },
        combinedFields(name, query, options) {
            return this.search(name, [{
                combined_fields: query
            }], options)
        },
        queryString(name, query, options) {
            return this.search(name, [{
                query_string: query
            }], options)
        },
        search(name, queries, options = {}) {
            const { dataContext, queryContext } = useWhitebox()
            return new Promise(resolve => {
                this.searchMap[name] = []
                this.searchMap[name].loaded = false
                if (!window.whitebox) return resolve([])
                window.whitebox.init('feed', (feed) => {
                    let data = {
                        context: dataContext,
                        vault: 'feed',
                        query: {
                            bool: {
                                must: [
                                    { 
                                        term: { 
                                            'context.keyword': queryContext 
                                        } 
                                    },
                                    ...queries
                                ],
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