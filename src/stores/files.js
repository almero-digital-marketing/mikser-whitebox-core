import { defineStore } from 'pinia'
import { useWhitebox } from "../stores/whitebox"

export const useWhiteboxFiles = defineStore('whitebox-files', {
    state: () => {
        return {
			filemap: {},
        }
    },
    actions: {
        storage(file, cache) {
            if(!file) return file

			if (!this.filemap[file]) { 
				this.link(file, cache)
			}
			return this.filemap[file] || ''
        },
        asset(preset, file, format, cache) {
            if(!file) return file

            let asset = `/assets/${preset}${format ? file.split('.').slice(0, -1).concat(format).join('.') : file}`

			if (!this.filemap[asset]) { 
				this.link(asset, cache)
			}
			return this.filemap[asset] || ''
        },
        link(file, context, cache = true) {
            const whiteboxStore = useWhitebox()
            window.whitebox.init('storage', (storage) => {
                if (storage) {
                    let data = {
                        file,
                        cache
                    }
                    if (whiteboxStore.context != 'mikser') {
                        data.context = whiteboxStore.context
                    }
                    if (context) {
                        data.context = context
                    }
                    let result = storage.service.link(data)
                    if (typeof result == 'string') {
                        if (this.filemap[file] != result) this.filemap[file] = result
                    } else {
                        result.then(link => {
                            if (this.filemap[file] != link) this.filemap[file] = link
                        })
                    }
                }
            })
        },
        sharedStorage(file) {
            if(!file) return file
			if (file.indexOf('/storage') != 0 && file.indexOf('storage') != 0) {
                if (file[0] == '/') file = '/storage' + file
				else file = '/storage/' + file
			}

			if (!this.filemap[file]) {
                const { shared } = useWhitebox(store)
				this.link(file, shared)
			}
			return this.filemap[file] || ''
        }

    }
})