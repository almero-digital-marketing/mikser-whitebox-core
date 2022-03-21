import { useWhiteboxRoutes } from "../stores/routes"

function onDocumentChanged(callback) {
    const routesStore = useWhiteboxRoutes()

    routesStore.$subscribe(mutation => {
        if (mutation.events.key == 'currentRefId') {
            callback(mutation.events.newValue, mutation.events.oldValue)
        }
    })
}

export {
    onDocumentChanged
}