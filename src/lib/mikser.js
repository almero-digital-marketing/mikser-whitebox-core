import { useWhitebox } from "../stores/whitebox"
import { useWhiteboxFiles } from "../stores/files"
import { useWhiteboxDocuments } from "../stores/documents"
import { useWhiteboxRoutes } from "../stores/routes"
import { useWhiteboxSearches } from "../stores/searches"
import { useWhiteboxTracking } from "../stores/tracking"
import { onDocumentChanged } from './hooks'

import navigation from './navigation'

export async function createMikser({ router, store, options }) {
	const whiteboxStore = useWhitebox(store)
	whiteboxStore.context = options.context
	whiteboxStore.shared = options.shared ? 'shared' : ''

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
			Object.defineProperty(app.config.globalProperties, '$sharedStorage', {
				get() {
					const filesStore = useWhiteboxFiles()
					return filesStore.sharedStorage
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
			Object.defineProperty(app.config.globalProperties, '$track', {
				get() {
					const tracking = useWhiteboxTracking()
					return {
						identity: tracking.identity,
						custom: tracking.custom,
						addToCart: tracking.addToCart,
						removeFromCart: tracking.removeFromCart,
						addToWishlist: tracking.addToWishlist,
						completeRegistration: tracking.completeRegistration,
						lead: tracking.lead,
						contact: tracking.contact,
						findLocation: tracking.findLocation,
						initiateCheckout: tracking.initiateCheckout,
						purchase: tracking.purchase,
						schedule: tracking.schedule,
						search: tracking.search,
						startTrial: tracking.startTrial,
						subscribe: tracking.subscribe,
						viewContent: tracking.viewContent,
						customizeProduct: tracking.customizeProduct,
						watch: tracking.watch
					}
				}
			})
			
			const documentsStore = useWhiteboxDocuments(store)
			documentsStore.liveReload(!!options.preloadDocuments)

			const tracking = useWhiteboxTracking(store)
			tracking.options = options
			onDocumentChanged(() => {
				tracking.pageView()
				tracking.session()
			})
		}
	}
}