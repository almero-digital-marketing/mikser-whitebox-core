export default class {
    constructor({ baseUrl = '', catlogName = "mikser", entitiesName, documentName = 'document', contextName = 'context', lang } = {}) {
        this.baseUrl = baseUrl
        this.documentName = documentName
        this.contextName = contextName
        this.lang = lang
        this.catlogName = catlogName
        this.entitiesName = entitiesName
    }
    async loadSitemap() {
        const response = await fetch(`${this.baseUrl}/data/${this.catlogName}.json`)
        const documents = await response.json()
        return documents.map(document => {
            let documentBase = ''
            if (this.lang) documentBase += `${this.lang}`
            if (this.entitiesName) documentBase += `/${this.entitiesName}`
            return {
                ...document,
                refId: documentBase ? document.refId.replace(`/${documentBase}`, '') : document.refId,
                name: documentBase ? document.name.replace(documentBase, '') : document.name,
            }
        })
    }
    loadDocuments(refIds) {
        return Promise.all(refIds.map(refId => {
            if (refId == '/') refId = '/index'

            let documentRoot = `${this.baseUrl}`
            if (this.lang) documentRoot += `/${this.lang}`
            if (this.entitiesName) documentRoot += `/${this.entitiesName}`
            documentRoot += `/data/${refId}${this.documentName ? '.' + this.documentName : ''}.json`
            
            return fetch(documentRoot)
            .then(responese => responese.json())
        }))
    }
    loadContext(refId) {
        if (refId == '/') refId = '/index'

        let contextRoot = `${this.baseUrl}`
        if (this.lang) contextRoot += `/${this.lang}`
        if (this.entitiesName) contextRoot += `/${this.entitiesName}`
        contextRoot += `/data/${refId}.${this.contextName}.json`

        return fetch(contextRoot)
        .then(responese => responese.json())
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