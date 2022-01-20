import { useWhiteboxFiles } from "../stores/files"
import { useWhiteboxDocuments } from "../stores/documents"
import { useWhiteboxRoutes } from "../stores/routes"
import navigation from './navigation'

export async function createMikser({ router, store, options }) {
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
			const documentsStore = useWhiteboxDocuments(store)
			const filesStore = useWhiteboxFiles(store)
			
			Object.defineProperty(app.config.globalProperties, '$href', {
				get() {
					return documentsStore.href
				}
			})
			Object.defineProperty(app.config.globalProperties, '$document', {
				get() {
					return documentsStore.document
				}
			})
			Object.defineProperty(app.config.globalProperties, '$alternates', {
				get() {
					return documentsStore.alternates
				}
			})
			Object.defineProperty(app.config.globalProperties, '$storage', {
				get() {
					return filesStore.storage
				}
			})
			
			documentsStore.liveReload(!!options.preloadDocuments)
		}
	}
}