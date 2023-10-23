import { defineStore } from 'pinia'
import { useWhiteboxDocuments } from '../stores/documents'
import Core from "../core"

export const useWhiteboxRoutes = defineStore('whitebox-routes', {
    state: () => {
        return {
            documentRoutes: {},
            reverseRoutes: {},
            projection: {},
            routes: [],
			currentRefId: decodeURI(window.location.pathname)
        }
    },
	getters: {
		collections() {
			const collections = {}
			for (let name in this.documentRoutes[this.currentRefId].collections) {
				let collection = this.documentRoutes[this.currentRefId].collections[name]
				if (collection.documents) {
					collections[name] = collection.documents.map(document => {
						return {
							loaded: true,
							meta: document.data.meta,
							link: encodeURI(document.refId),
							content: document.data.content
						}
					})
					collections[name].loaded = true
				} else {
					collections[name] = []
					collections[name].loaded = false
				}
				if (collection.error) {
					collections[name].error = collection.error
				}
			}
			return collections
		},
		documentRoute() {
			return this.documentRoutes[this.currentRefId]
		}
	},
    actions: {
		async loadRoute(refId, to, from) {
			const documentsStore = useWhiteboxDocuments()
			const loadDocuments = []
			const documentRoute = this.documentRoutes[refId]
			const document = documentsStore.sitemap[documentRoute.document.meta.lang][documentRoute.href]
			for(let name in documentRoute.collections) {
				let collection = await documentRoute.collections[name].query({
					meta: document.data.meta,
					link: encodeURI(document.refId),
				}, to, from)
				if (collection) {
					if (!Array.isArray(collection)) {
						collection = [collection]
					}
					loadDocuments.push(
						documentsStore.loadDocuments(collection)
						.then(documents => {
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
        async loadRoutes({ documentRoutes, reverseRoutes, routeDefinitions }) {
			Object.assign(this.documentRoutes, documentRoutes)
            Object.assign(this.reverseRoutes, reverseRoutes)
			console.log('Routes:', Object.keys(routeDefinitions).length)
			const documents = await Core.dataSource.loadSitemap()
			let routes = []
			for (let document of documents) {
				const routeDefinition = routeDefinitions[document.data.meta.component]
				
				this.reverseRoutes[document.data.meta.href] = this.reverseRoutes[document.data.meta.href] || []
				this.reverseRoutes[document.data.meta.href].push({ 
					refId: document.refId,
					document: document.data,
					endpoint: 'mikser'
				})
				let collections = {}
				if (routeDefinition?.meta?.collections) {
					for(let collectionName in routeDefinition.meta.collections) {
						collections[collectionName] = {
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
				
				if (routeDefinition) {
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
			}
			console.log('Routes:', routes, Date.now() - window.startTime + 'ms')
			this.routes = routes
		
			return routes	
		}
	}
})