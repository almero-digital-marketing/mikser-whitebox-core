import { useWhiteboxRoutes } from "../stores/routes"

function onDocumentChanged(callback) {
    const routesStore = useWhiteboxRoutes()
    routesStore.$subscribe(mutation => {
        if (mutation.storeId == 'currentRefId') {
            callback()
        }
    })
}

export {
    onDocumentChanged
}