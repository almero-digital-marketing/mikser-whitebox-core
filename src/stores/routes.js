import { defineStore } from 'pinia'

export const useWhiteboxRoutes = defineStore('whitebox-routes', {
    state: () => {
        return {
            documentRoutes: {},
            reverseRoutes: {},
            projection: {},
            routes: []
        }
    },
    actions: {
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
								this.reverseRoutes[document.data.meta.href] = this.reverseRoutes[document.data.meta.href] || []
								this.reverseRoutes[document.data.meta.href].push({ 
									refId: document.refId,
									document: document.data,
									endpoint: 'mikser'
								})
								this.documentRoutes[document.refId] = {
									href: document.data.meta.href,
									document: document.data,
									endpoint: 'mikser'
								}
								const routeDefinition = routeDefinitions[document.data.meta.layout] || {}
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