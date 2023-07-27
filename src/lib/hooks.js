import { useWhiteboxRoutes } from "../stores/routes"
import { useWhiteboxDocuments } from "../stores/documents"
import { watch } from 'vue'
import { storeToRefs } from 'pinia'

function onDocumentChanged(callback) {
    const routesStore = useWhiteboxRoutes()
    const { currentRefId } = storeToRefs(routesStore)
    watch(currentRefId, callback)
}

function onCollectionLoaded(collection, callback) {
    const documentsStore = useWhiteboxDocuments()
    const routesStore = useWhiteboxRoutes()
    watch(documentsStore.document.documentRoute.collections[collection], () => callback(routesStore.collections[collection]))
}

function onVersionChanged(version, callback) {
    const oldVersion = localStorage.getItem('WHITEBOX_VERSION')
    if (oldVersion != version) {
        callback(version, oldVersion)
    }
    localStorage.setItem('WHITEBOX_VERSION', version)
}

export {
    onDocumentChanged,
    onCollectionLoaded,
    onVersionChanged
}