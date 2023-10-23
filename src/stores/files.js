import { defineStore } from 'pinia'
import Core from "../core"

export const useWhiteboxFiles = defineStore('whitebox-files', {
    state: () => {
        return {
			filemap: {},
        }
    },
    actions: {
        storage(file, cache) {
            if(!file) return file
            return this.link(file, { cache })
        },
        asset(preset, file, format, cache) {
            if(!file) return file
            let asset = `/assets/${preset}${format ? file.split('.').slice(0, -1).concat(format).join('.') : file}`
            return this.link(asset, { cache })
        },
        link(file, options) {
            Core.dataSource.getLink(file, options)
            .then(link => {
                if (this.filemap[file] != link) this.filemap[file] = link
            })
            return this.filemap[file] || ''
        },
        sharedStorage(file) {
            Core.dataSource.getSharedLink(file, options)
            .then(link => {
                if (this.filemap[file] != link) this.filemap[file] = link
            })
            return this.filemap[file] || ''

        }

    }
})