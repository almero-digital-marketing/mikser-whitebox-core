import { useWhitebox } from "../stores/whitebox"
import { useWhiteboxFiles } from "../stores/files"
import { useWhiteboxDocuments } from "../stores/documents"
import { useWhiteboxRoutes } from "../stores/routes"
import { useWhiteboxSearches } from "../stores/searches"
import navigation from './navigation'

export async function createMikser({ router, store, options }) {
	const whitebox = useWhitebox(store)
	whitebox.context = options.context

	const routesStore = useWhiteboxRoutes(store)
	let routeDefinitions = {}
	for (let route of router.options.routes) {
		routeDefinitions[route.name] = route
	}
	let routes = await routesStore.loadRoutes({ ...options, routeDefinitions })
	for (let route of routes.filter(route => route.component)) {
		router.addRoute(route)
	}

	return {
		install(app) {
			app.use(navigation)
			
			Object.defineProperty(app.config.globalProperties, '$href', {
				get() {
					const documentsStore = useWhiteboxDocuments()
					return documentsStore.href
				}
			})
			Object.defineProperty(app.config.globalProperties, '$document', {
				get() {
					const documentsStore = useWhiteboxDocuments()
					return documentsStore.document
				}
			})
			Object.defineProperty(app.config.globalProperties, '$alternates', {
				get() {
					const documentsStore = useWhiteboxDocuments()
					return documentsStore.alternates
				}
			})
			Object.defineProperty(app.config.globalProperties, '$storage', {
				get() {
					const filesStore = useWhiteboxFiles()
					return filesStore.storage
				}
			})
			Object.defineProperty(app.config.globalProperties, '$collections', {
				get() {
					const routesStore = useWhiteboxRoutes()
					return routesStore.collections
				}
			})
			Object.defineProperty(app.config.globalProperties, '$hits', {
				get() {
					const searchesStore = useWhiteboxSearches()
					return searchesStore.hits
				}
			})
			
			const documentsStore = useWhiteboxDocuments()
			documentsStore.liveReload(!!options.preloadDocuments)
		}
	}
}