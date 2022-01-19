import navigation from './navigation'
import { useWhiteboxFiles } from "../stores/files"
import { useWhiteboxDocuments } from "../stores/documents"
import { useWhiteboxRoutes } from "../stores/routes"

export function createMikser() {
	let mikser = {}
	const routesStore = useWhiteboxRoutes()
	const filesStore = useWhiteboxFiles()
	const documentsStore = useWhiteboxDocuments()

	return {
		install(app, options) {
			mikser = {
				app,
				options
			}
			
			app.config.globalProperties.$storage = filesStore.storage
			app.config.globalProperties.$href = documentsStore.href
			app.config.globalProperties.$document = documentsStore.document
			app.config.globalProperties.$alternates = documentsStore.alternates
			
			app.use(navigation, options)
		},
		async init() {
			const router = mikser.app.config.globalProperties.$router
			let routeDefinitions = {}
			for (let route of router.options.routes) {
				routeDefinitions[route.name] = route
			}
			let routes = await routesStore.loadRoutes({ ...mikser.options, routeDefinitions })
			for (let route of routes) {
				router.addRoute(route)
			}
			documentsStore.liveReload()
		}
	}
}