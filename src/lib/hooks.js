import { useWhiteboxRoutes } from "../stores/routes"

function onDocumentChanged(callback) {
    const routesStore = useWhiteboxRoutes()

    routesStore.$subscribe(({ events }) => {
        if (events?.key == 'currentRefId') {
            callback(events.newValue, events.oldValue)
        }
    })
}

export {
    onDocumentChanged
}