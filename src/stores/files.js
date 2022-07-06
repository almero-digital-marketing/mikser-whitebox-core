import { defineStore } from 'pinia'
import { useWhitebox } from "../stores/whitebox"

export const useWhiteboxFiles = defineStore('whitebox-files', {
    state: () => {
        return {
			filemap: {},
        }
    },
    actions: {
        storage(file) {
            if(!file) return file
			if (file.indexOf('/storage') != 0 && file.indexOf('storage') != 0) {
                if (file[0] == '/') file = '/storage' + file
				else file = '/storage/' + file
			}

			if (!this.filemap[file]) { 
				this.link(file)
			}
			return this.filemap[file] || ''
        },
        link(file) {
            const { context } = useWhitebox()
            window.whitebox.init('storage', (storage) => {
                if (storage) {
                    let data = {
                        file,
                    }
                    if (context != 'mikser') {
                        data.context = context
                        data.cache = false
                    } else {
                        data.cache = true
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
        }
    }
})