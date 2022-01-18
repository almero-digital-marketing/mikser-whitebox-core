import { defineStore } from 'pinia'

const defaultProjection = {
    'data.meta.layout': 1,
    'refId': 1,
    'data.meta.href': 1,
    'data.meta.route': 1,
    'data.meta.lang': 1,
    'data.meta.type': 1, 
}

export const useWhiteboxConfig = defineStore('wihtebox-config', {
    state: {
        documentRoutes: {},
        reverseRoutes: {},
        projection: defaultProjection
    },
    actions: {
        apply({documentRoutes, reverseRoutes, projection}) {
            Object.assign(this.documentRoutes, documentRoutes)
            Object.assign(this.reverseRoutes, reverseRoutes)
            this.projection = Object.assign({}, projection, defaultProjection)
        }
    }
})