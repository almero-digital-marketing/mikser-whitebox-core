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
            if (this.context != 'mikser') {
                if (this.shared) return ['mikser_' + this.context, this.shared]
                return ['mikser_' + this.context]
            }
            if (this.shared) return ['mikser', this.shared]
            return ['mikser']
        },
        dataContext() {
            if (this.context != 'mikser') {
                if (this.shared) return [this.context, this.shared]
                return [this.context]
            }
        }
    }
})