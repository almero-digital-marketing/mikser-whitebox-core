import { defineStore } from 'pinia'

export const useWhitebox = defineStore('whitebox', {
    state: () => {
        return {
			context: 'mikser',
        }
    },
    getters: {
        queryContext() {
            if (this.context != 'mikser') {
                return 'mikser_' + this.context
            }
            return 'mikser'
        },
        dataContext() {
            if (this.context != 'mikser') {
                return this.context
            }
        }
    }
})