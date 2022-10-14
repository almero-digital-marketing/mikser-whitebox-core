import { defineStore } from 'pinia'

export const useWhitebox = defineStore('whitebox', {
    state: () => {
        return {
			context: 'mikser',
            shared: ''
        }
    },
    getters: {
        queryContext() {
            return this.dataContext.map(context => {
                if (context == 'mikser') return context
                return 'mikser_' + context
            })
        },
        dataContext() {
            if (this.shared) return [this.context || 'mikser', this.shared]
            return [this.context || 'mikser']
        }
    }
})