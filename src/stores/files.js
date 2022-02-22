import { defineStore } from 'pinia'

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
            window.whitebox.init('storage', (storage) => {
                if (storage) {
                    let data = {
                        file,
                    }
                    if (typeof process != 'undefined' && process.env['VUE_APP_WHITEBOX_CONTEXT']) {
                        data.context = process.env['VUE_APP_WHITEBOX_CONTEXT']
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