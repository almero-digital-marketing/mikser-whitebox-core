import { defineStore } from 'pinia'

export const useWhiteboxShortener = defineStore('whitebox-shortener', {
    state: () => {
        return {
            data: {}
        }
    },
    actions: {
        async loadData() {
            return new Promise(resolve => {
                window.whitebox?.init('shortener', shortener => {
                    if (shortener) {
                        this.data = shortener.service.data
                        resolve(shortener.service.data)
                    }
                })
            })
        },
        async link(url, data) {    
            return new Promise(resolve => {
                if (!window.whitebox) return resolve([])
                window.whitebox.init('shortener', (shortener) => {
                    if (shortener){
                        shortener.service.link(url, data).then(resolve)
                    }
                })
            })
        }
    }
})