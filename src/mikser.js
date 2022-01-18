import navigation from './navigation'
import { useWhiteboxFiles } from "./stores/files"
import { useWhiteboxDocuments } from "./stores/documents"
import { useWhiteboxConfig } from "./stores/config"

export default {
	install(app, options) {
		const configStore = useWhiteboxConfig()
		const filesStore = useWhiteboxFiles()
		const documentsStore = useWhiteboxDocuments()

		configStore.apply(options)

		app.config.globalProperties.$storage = filesStore.storage
		app.config.globalProperties.$href = documentsStore.href
		app.config.globalProperties.$document = documentsStore.document
		app.config.globalProperties.$alternates = documentsStore.alternates

		app.use(navigation, options)
	},
	async init() {
		const router = app.config.globalProperties.$router
		let routeDefinitions = {}
		for (let route of router.options.routes) {
			routeDefinitions[route.name] = route
		}
	
		return new Promise((resolve, reject) => {
			window.whitebox.init('feed', (feed) => {
				let data = {
					vault: 'feed',
					query: { context: 'mikser' },
					projection: this.config.projection,
					cache: '1h',
				}
				if (process.env.VUE_APP_WHITEBOX_CONTEXT) {
					data.context = process.env.VUE_APP_WHITEBOX_CONTEXT
					data.query.context = data.query.context + '_' + data.context
				}
				if (feed.service.catalogs.mikser) {
					feed.service.catalogs.mikser
						.find(data)
						.then((documents) => {
							let routes = []
							for (let document of documents) {
								this.config.reverseRoutes[document.data.meta.href] = this.config.reverseRoutes[document.data.meta.href] || []
								this.config.reverseRoutes[document.data.meta.href].push({ 
									refId: document.refId,
									document: document.data,
									endpoint: 'mikser'
								})
								this.config.documentRoutes[document.refId] = {
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
									props: this.config.documentRoutes[document.refId],
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
										props: this.config.documentRoutes[document.refId],
									})
								}
							}
							for(let route of routes.filter(route => route.component)) {
								router.addRoute(route)
							}
							console.log('Routes:', routes.length, Date.now() - window.startTime + 'ms') //, routes)
							resolve()
						})
						.catch(reject)
				} else {
					console.warn('Mikser catalog is missing')
				}
			})
		})
	}
}