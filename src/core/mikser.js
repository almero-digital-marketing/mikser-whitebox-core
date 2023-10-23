export default class {
    constructor({ baseUrl = '' } = {}) {
        this.baseUrl = baseUrl
    }
    async loadSitemap() {
        const response = await fetch(`${this.baseUrl}/data/mikser.json`)
        const documents = await response.json()
        return documents
    }
    loadDocuments(refIds) {
        return Promise.all(refIds.map(refId => {
            if (refId == '/') refId = '/index'
            return fetch(`${this.baseUrl}/data/${refId}.json`)
            .then(responese => responese.json())
        }))
    }
    async loadDocumentsByQuery(query) {
        const response = await fetch(`${this.baseUrl}/data/${query.path || query}.json`)
        const documents = await response.json()
        return documents
    }
    async getLink(file) {
        return `${window.location.origin}${file}`
    }
}