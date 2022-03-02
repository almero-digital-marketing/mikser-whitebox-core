import { defineStore } from 'pinia'
import { useWhiteboxDocuments } from '../stores/documents'

export const useWhiteboxRoutes = defineStore('whitebox-routes', {
    state: () => {
        return {
            documentRoutes: {},
            reverseRoutes: {},
            projection: {},
            routes: [],
			currentRefId: '/'
        }
    },
	getters: {
		collections() {
			const collections = {}
			for (let name in this.documentRoutes[this.currentRefId].collections) {
				let collection = this.documentRoutes[this.currentRefId].collections[name]
				collections[name] = collection.documents.map(document => {
					return {
                        loaded: true,
                        meta: document.data.meta,
                        link: encodeURI(document.refId),
                    }
				})
				collections[name].loaded = collection.loaded
				collections[name].error = collection.error
			}
			return collections
		},
		documentRoute() {
			return this.documentRoutes[this.currentRefId]
		}
	},
    actions: {
		async loadCollections(refId) {
			refId = refId || this.currentRefId
			const documentsStore = useWhiteboxDocuments()
			const loadDocuments = []
			const documentRoute = this.documentRoutes[refId]
			const document = documentsStore.sitemap[documentRoute.document.meta.lang][documentRoute.href]
			for(let name in documentRoute.collections) {
				let collection = await documentRoute.collections[name].query({
					meta: document.data.meta,
					link: encodeURI(document.refId),
				})
				if (collection) {
					if (!Array.isArray(collection)) {
						collection = [collection]
					}
					loadDocuments.push(
						documentsStore.loadDocuments(collection)
						.then(documents => {
							documentRoute.collections[name].loaded = true
							documentRoute.collections[name].documents = documents
						})
						.catch(error => {
							documentRoute.collections[name].error = error
							throw error
						})
					)
				}
			}
			return Promise.all(loadDocuments)
		},
        loadRoutes({ documentRoutes, reverseRoutes, projection, routeDefinitions }) {
			Object.assign(this.documentRoutes, documentRoutes)
            Object.assign(this.reverseRoutes, reverseRoutes)
            this.projection = Object.assign({}, projection, {
				'data.meta.layout': 1,
				'refId': 1,
				'data.meta.href': 1,
				'data.meta.route': 1,
				'data.meta.lang': 1,
				'data.meta.type': 1, 
			})
			
            return new Promise((resolve, reject) => {
				if (!window.whitebox) return resolve([])
				window.whitebox.init('feed', (feed) => {
					let data = {
						vault: 'feed',
						query: { context: 'mikser' },
						projection: this.projection,
						cache: '1h',
					}
					if (typeof process != 'undefined' && process.env['VUE_APP_WHITEBOX_CONTEXT']) {
						data.context = process.env['VUE_APP_WHITEBOX_CONTEXT']
						data.query.context = data.query.context + '_' + data.context
					}
					if (feed.service.catalogs.mikser) {
						feed.service.catalogs.mikser
						.find(data)
						.then((documents) => {
							let routes = []
							for (let document of documents) {
								const routeDefinition = routeDefinitions[document.data.meta.layout] || {}
								
								this.reverseRoutes[document.data.meta.href] = this.reverseRoutes[document.data.meta.href] || []
								this.reverseRoutes[document.data.meta.href].push({ 
									refId: document.refId,
									document: document.data,
									endpoint: 'mikser'
								})
								let collections = {}
								if (routeDefinition.meta?.collections) {
									for(let collectionName in routeDefinition.meta.collections) {
										collections[collectionName] = {
											documents: [],
											loaded: false,
											query: routeDefinition.meta.collections[collectionName]
										}
									}
								}
								this.documentRoutes[document.refId] = {
									href: document.data.meta.href,
									document: document.data,
									endpoint: 'mikser',
									collections
								}
								
								routes.push({
									path: encodeURI(document.refId),
									component: routeDefinition.component,
									meta: routeDefinition.meta,
									alias: ['/' + document.data.meta.lang + document.data.meta.href],
										props: this.documentRoutes[document.refId],
									})
									if (document.data.meta.route) {
										let documentMeta = { ...routeDefinition.meta }
										documentMeta.refId = document.refId
										if (documentMeta.documents) {
											if (Array.isArray(documentMeta.documents)) {
												documentMeta.documents = [document.refId, ...documentMeta.documents]
											} else {
												documentMeta.documents = [document.refId, documentMeta.documents]
											}
										} else {
											documentMeta.documents = document.refId
										}
										routes.push({
											path: encodeURI(document.refId) + document.data.meta.route,
											component: routeDefinition.component,
											meta: documentMeta,
											props: this.documentRoutes[document.refId],
										})
									}
								}
								console.log('Routes:', routes.length, Date.now() - window.startTime + 'ms')
                                this.routes = routes
							
								resolve(routes)
							})
							.catch(reject)
						} else {
							console.warn('Mikser catalog is missing')
							resolve([])
						}
					})
				})
			}
		}
	})