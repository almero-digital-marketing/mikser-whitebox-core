import { useWhiteboxRoutes } from "../stores/routes"
import { useWhiteboxDocuments } from "../stores/documents"
import { watch } from 'vue'

function onDocumentChanged(callback) {
    const routesStore = useWhiteboxRoutes()

    routesStore.$subscribe(({ events }) => {
        if (events?.key == 'currentRefId') {
            callback(events.newValue, events.oldValue)
        }
    })
}

function onCollectionLoaded(collection, callback) {
    const documentsStore = useWhiteboxDocuments()
    const routesStore = useWhiteboxRoutes()
    watch(documentsStore.document.documentRoute.collections[collection], () => callback(routesStore.collections[collection]))
}

export {
    onDocumentChanged,
    onCollectionLoaded
}