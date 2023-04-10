import { defineStore } from 'pinia'

export const useWhiteboxPassports = defineStore('whitebox-passsports', {
    state: () => {
        return {
            passport: {}
        }
    },
    actions: {
        async start() {    
            window.whitebox?.init('passports', passports => {
                if (passports) {
                    this.passport = window.whitebox.services.passports?.passport || {}

                    window.whitebox.emmiter.on('passports.denounce', function() {
                        setTimeout(this.$reset, 3000)
                    })
                    window.whitebox.emmiter.on('passports.passport', passport => {
                        this.passport = passport
                    })
                }
            })
        }
    }
})