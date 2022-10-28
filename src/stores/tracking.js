import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import { version } from '../../package.json'
axios.defaults.withCredentials = true

function sha256(val) {
    if (typeof val == 'object') {
        val = JSON.stringify(val)
    }
    if (!crypto.subtle) return val
    return crypto.subtle
    .digest('SHA-256', new TextEncoder('utf-8').encode(val))
    .then(h => {
        let hexes = [],
        view = new DataView(h)
        for (let i = 0; i < view.byteLength; i += 4) {
            hexes.push(('00000000' + view.getUint32(i).toString(16)).slice(-8));
        }
        return hexes.join('')
    })
}

function localKey(key) {
    return key + '@' + version.split('.')[0]
}

function removeUndefined(obj, mutate = false, recursive = 0) {
	const returnObj = {}
	Object.entries(obj).forEach(([key, val]) => {
		if(val === undefined) {
			if (mutate) {
				delete obj[key]
			}
		} else {
      let recursiveVal
      if (recursive > 0 && val !== null && typeof val === 'object') {
        recursiveVal = removeUndefined(val, mutate, typeof recursive === 'number' ? (recursive - 1) : true )
      }
      if (!mutate) {
        returnObj[key] = recursiveVal || val
      }
    }
	})
	return mutate ? obj : returnObj
}

function getFbp() {
    let result = /_fbp=(fb\.1\.\d+\.\d+)/.exec(window.document.cookie)
    if (!(result && result[1])) return null
    return result[1]
}

function getFbc() {
    let result = /_fbc=(fb\.1\.\d+\.\d+)/.exec(window.document.cookie);
    if (!(result && result[1])) {
        if(window.location.search.includes('fbclid=')) {
            const queryString = window.location.search
            const urlParams = new URLSearchParams(queryString)
            fbc = 'fb.1.'+ (+new Date()) +'.'+ urlParams.get('fbclid')
            return fbc
        } else {
            return null
        }
    }
    return result[1]
}

function items2gtag(items) {
    if (!items) return {}
    return {
        items: items.map((item, index) => {
            return {
                item_id: item.itemId,
                item_name: item.name,
                affiliation: item.affiliation,
                coupon: item.coupon,
                currency: item.currency,
                discount: item.discount,
                index,
                item_brand: item.brand,
                item_category: (item.categories || [])[0],
                item_category2: (item.categories || [])[1],
                item_category3: (item.categories || [])[2],
                item_category4: (item.categories || [])[3],
                item_category5: (item.categories || [])[4],
                item_list_id: item.listId,
                item_list_name: item.listName,
                item_variant: item.variant,
                location_id: item.locationId,
                price: (item.price || 0).toFixed(2),
                quantity: item.quantity || 1
            }
        }),
        currency: items[0].currency,
        value: items.reduce((sum, item) => sum + (item.quantity || 1) * ((item.price || 0) - (item.discount || 0)), 0).toFixed(2),   
    }
}

function items2fbq(items) {
    if (!items) return {}
    return {
        content_ids: items.map(item => item.itemId.toString()),
        content_type: 'product',
        contents: items.map(item => {
            return {
                id: item.itemId.toString(),
                quantity: item.quantity || 1
            }
        }),
        content_name: items.map(item => item.name).join(', '),
        currency: items[0].currency,
        value: items.reduce((sum, item) => sum + (item.quantity || 1) * ((item.price || 0) - (item.discount || 0)), 0).toFixed(2),
    }
}


export const useWhiteboxTracking = defineStore('whitebox-tracking', {
    state: () => {
        return {
            identities: [],
            options: {}
        }
    },
    actions: {
        async trackFacebook(track, event, context = {}) {
            const eventId = uuidv4()
            if (window.fbq) {
                window.fbq(track, event, context, { eventID: eventId })
            }

            let data = {
                event,
                eventId,
                context,
                url: window.location.href,
                timestamp: Date.now()
            }

            const { connect } = window.whitebox.services
            let userId = localStorage.getItem(localKey('whiteboxUserId')) || await sha256(connect.runtime.fingerprint)
            data.identities = [ 
                ...this.identities, 
                { 
                    id: "fingerprint",
                    name: "userId", 
                    value: userId
                }
            ]
            if (connect.runtime.sst) {
                await axios.post(`${connect.runtime.url}/track`, data, {
                    headers: {
                        'Authorization': 'Bearer ' + connect.runtime.tokens.connect,
                        'Fingerprint': connect.runtime.fingerprint,
                    }
                }).catch(console.error)
            }  
        },
        trackContext(data = {}) { 
            return new Promise(resolve => {
                window.whitebox?.init('analytics', analytics => {
                    if (analytics) {
                        const { analytics } = window.whitebox.services
                        data.vaultId = analytics.runtime.vaultId
                       
                        axios.post(`${analytics.runtime.url}/context`, data, {
                            headers: {
                                'Authorization': 'Bearer ' + analytics.runtime.token,
                                'Fingerprint': analytics.runtime.fingerprint,
                            }
                        })
                        .catch(console.error)
                        .then(resolve)
                    } else {
                        resolve()
                    }
                })
            })
        },
        async identity(identities, userName = 'email') {
            if (!window.whitebox) return
            const { connect } = window.whitebox.services
            let userId = await sha256(connect.runtime.fingerprint)
            
            return axios.post(`${connect.runtime.url}/identity`, {
                identities
            }, {
                headers: {
                    'Authorization': 'Bearer ' + connect.runtime.tokens.connect,
                    'Fingerprint': connect.runtime.fingerprint,
                }
            })
            .then(async (response) => {
                let diff = false
                const currentIdentities = [...this.identities]
                console.log('Current identities:', currentIdentities)
                for (let identity of response.data.identities) {
                    let userIdentiy = currentIdentities.find(({ key, name }) => key == identity.key && name == identity.name)
                    if (userIdentiy && userIdentiy.value != identity.value) {
                        userIdentiy.value = identity.value
                        diff = true
                    } else if (!userIdentiy) {
                        this.identities.push(identity)
                        diff = true
                    }
                    const userInfo = this.identities.find(({ name }) => name == userName)?.value
                    if (userInfo) {
                        userId = await sha256(userInfo)
                        localStorage.setItem(localKey('whiteboxUserId'), userId)
                    }
                }
                if (diff) {
                    console.log('Track identity')
                    if (window.fbq) {
                        window.fbq('init', this.options.fbq, removeUndefined({
                            em: this.identities.find(({ name }) => name == 'email')?.value,
                            ph: this.identities.find(({ name }) => name == 'e164')?.value.replace('+',''),
                            fn: this.identities.find(({ name }) => name == 'firstname')?.value,
                            ln: this.identities.find(({ name }) => name == 'lastname')?.value,
                            db: this.identities.find(({ name }) => name == 'birthdate')?.value.replace(/\//g, ''),
                            ge: this.identities.find(({ name }) => name == 'gender')?.value,
                            country: this.identities.find(({ name }) => name == 'country')?.value,
                            external_id: userId
                        }))
                    }
                    if (window.gtag) {
                        if (Array.isArray(this.options.gtag)) {
                            for(let tagId of this.options.gtag) {
                                window.gtag('config', tagId, {
                                    user_id: userId
                                })
                            }
                        } else {
                            window.gtag('config', this.options.gtag, {
                                user_id: userId
                            })
                        }
                        window.gtag('set', 'user_data', removeUndefined({
                            email: this.identities.find(({ name }) => name == 'email')?.value,
                            phone_number: this.identities.find(({ name }) => name == 'e164')?.value,
                            address: {
                                first_name: this.identities.find(({ name }) => name == 'firstname')?.value,
                                last_name: this.identities.find(({ name }) => name == 'lastname')?.value,
                                city: this.identities.find(({ name }) => name == 'city')?.value,
                                country: this.identities.find(({ name }) => name == 'country')?.value,
                                region: this.identities.find(({ name }) => name == 'region')?.value,
                                street: this.identities.find(({ name }) => name == 'street')?.value,
                                postal_code: this.identities.find(({ name }) => name == 'postalcode')?.value,
                            }
                        }, false, 1))
                    }
                }
            })

        },
        async start(options) {
            if (options) {
                this.options = options
            }

            const { connect } = window.whitebox.services
            let userId = localStorage.getItem(localKey('whiteboxUserId')) || await sha256(connect.runtime.fingerprint)

            const fbp = getFbp()
            if (fbp) {
                this.identities.push({ id: 'fingerprint', name: 'fbp', value: fbp })
                console.log('Fbp:', fbp)
            }
            const fbc = getFbc()
            if (fbc) {
                this.identities.push({ id: 'fingerprint', name: 'fbc', value: fbc })
                console.log('Fbc:', fbp)
            }
            
            if (window.fbq) {
                window.fbq('init', this.options.fbq, {
                    external_id: userId
                })          
            }
            
            if (window.gtag) {
                window.gtag('js', new Date())
                if (Array.isArray(this.options.gtag)) {
                    for(let tagId of this.options.gtag) {
                        window.gtag('config', tagId, {
                            user_id: userId
                        })
                    }
                } else {
                    window.gtag('config', this.options.gtag, {
                        user_id: userId
                    })
                }
            }

            await this.trackFacebook('track', 'PageView')
            
            const queryString = window.location.search
            const urlParams = new URLSearchParams(queryString)
            if (urlParams.has('utm_source')) {
                const source = urlParams.get('utm_source')
                const medium = urlParams.get('utm_medium')
                const campaign = urlParams.get('utm_campaign')

                console.log('Track utm:', source, medium, campaign)
                let event = 'Utm'+ source.charAt(0).toUpperCase() + source.slice(1)
                await this.trackFacebook('trackCustom', event, {
                    source,
                    medium,
                    campaign,
                })
            }

            window.whitebox?.init('shortener', shortener => {
                if (shortener) {
                    if (shortener.service.data?.email || shortener.service.data?.phone) {
                        this.contact(shortener.service.data)
                    }
                }
            })
        },
        custom(action, data) {
            window.whitebox?.services?.analytics?.context(action, data) 
                || 
            window.whitebox?.init('analytics', analytics => analytics.service.context(action, data))
        },
        async pageView() {          
            console.log('Track page view:', decodeURI(window.location.pathname))
           
            if (window.gtag) {
                window.gtag('set', 'page_path', decodeURI(window.location.pathname))
                window.gtag('event', 'page_view')
            }

            window.whitebox?.init('analytics', analytics => {
                if (analytics) {
                    analytics.service.info()
                }
            })
        },
        async addToCart(items) {           
            console.log('Track add to cart:', items.map(item => item.name).join(', '))
                      
            if (window.gtag) {
                window.gtag('event', 'add_to_cart', items2gtag(items))
            }
            
            await this.trackFacebook('track', 'AddToCart', items2fbq(items))
            await this.trackContext({
                action: 'addToCart',
                context: items,
            })
        },
        async removeFromCart(items) {
            console.log('Track remove from cart:', items.map(item => item.name).join(', '))
           
            if (window.gtag) {
                window.gtag('event', 'remove_from_cart', items2gtag(items))
            }

            await this.trackContext({
                action: 'removeFromCart',
                context: items,
            })

        },
        async addToWishlist(items) {
            console.log('Track add to wishlist:', items.map(item => item.name).join(', '))
            
            if (window.gtag) {
                window.gtag('event', 'add_to_wishlist', items2gtag(items))
            }
            
            await this.trackFacebook('track', 'AddToWishlist', items2fbq(items))
            await this.trackContext({
                action: 'addToWishlist',
                context: items,
            })
        },
        async completeRegistration(method) {
            console.log('Track complete registration:', method)
            
            if (window.gtag) {
                window.gtag('event', 'sign_up', { method })
            }
            
            await this.trackFacebook('track', 'CompleteRegistration', { content_name: method })
            await this.trackContext({
                action: 'completeRegistration',
                context: method,
            })
        },
        async lead(info) {
            console.log('Track lead:', info.currency, info.value)
            
            if (window.gtag) {
                window.gtag('event', 'generate_lead', { 
                    currency: info.currency,
                    value: info.value,
                })
            }
            
            await this.trackFacebook('track', 'Lead', {
                content_name: info.name,
                content_category: info.category,
                currency: info.currency,
                value: info.value,
            })
            await this.trackContext({
                action: 'lead',
                context: info,
            })
        },
        async contact(info) {           
            console.log('Track contact')
                    
            if (window.gtag) {
                window.gtag('event', 'contact', {
                    event_label: info.name,
                    event_category: info.category,
                })
            }

            await this.trackFacebook('track', 'Contact',{
                content_name: info.name,
                content_category: info.category,
            })
            await this.trackContext({
                action: 'contact',
                context: info
            })
        },
        async findLocation(location) {
            console.log('Track find location:', location.category, location.locationId)
            
            if (window.gtag) {
                window.gtag('event', 'select_content', { 
                    content_type: location.category ? 'location_' + location.category : 'location',
                    item_id: location.locationId
                })
            }
            
            await this.trackFacebook('track', 'FindLocation', {
                content_category: location.category ? 'location_' + location.category : 'location',
                content_name: location.locationId
            })
            await this.trackContext({
                action: 'findLocation',
                context: location.locationId,
            })
        },
        async initiateCheckout(items) {
            console.log('Track initiate checkout:', items?.map(item => item.name).join(', '))
            
            if (window.gtag) {
                window.gtag('event', 'begin_checkout', items2gtag(items))
            }
            
            await this.trackFacebook('track', 'InitiateCheckout', items2fbq(items))
            await this.trackContext({
                action: 'initiateCheckout',
                context: items,
            })
        },
        async purchase(items) {
            console.log('Track purchase:', items.map(item => item.name).join(', '))
            
            if (window.gtag) {
                window.gtag('event', 'purchase', items2gtag(items))
            }
            
            await this.trackFacebook('track', 'Purchase', {
                ...items2fbq(items),
                transaction_id: uuidv4()
            })
            await this.trackContext({
                action: 'purchase',
                context: items,
            })
        },
        async schedule() {
            console.log('Track schedule')
                    
            await this.trackFacebook('track', 'Schedule')
            await this.trackContext({
                action: 'schedule',
            })
        },
        async search(term) {
            console.log('Track lead:', term)
            
            if (window.gtag) {
                window.gtag('event', 'search', { 
                    search_term: term,
                })
            }
            
            await this.trackFacebook('track', 'Search', { search_string: term })
            await this.trackContext({
                action: 'search',
                context: term,
            })
        },
        async startTrial(info) {
            console.log('Track start trail:', info.currency, info.value, info.predictedLtv)
            
            if (window.gtag) {
                window.gtag('event', 'generate_lead', { 
                    currency: info.currency,
                    value: info.value,
                })
            }

            await this.trackFacebook('track', 'StartTrial', {
                currency: info.currency,
                value: info.value,
                predicted_ltv: info.predictedLtv,
            })
            await this.trackContext({
                action: 'startTrial',
                context: info,
            })
        },
        async subscribe(info = {}) {
            console.log('Track subscribe:', info.currency, info.value, info.predictedLtv)
            
            if (window.gtag) {
                window.gtag('event', 'generate_lead', { 
                    currency: info.currency,
                    value: info.value || 0,
                })
            }
            
            await this.trackFacebook('track', 'Subscribe', {
                currency: info.currency,
                value: info.value || 0,
                predicted_ltv: info.predictedLtv || 0,
            })
            await this.trackContext({
                action: 'subscribe',
                context: info,
            })
        },
        async viewContent(info = {}) {
            console.log('Track view content:', info.category, info.name, info.contentId, info.currency, info.value)
            
            if (window.gtag) {
                window.gtag('event', 'select_content', { 
                    content_type: info.category,
                    item_id: info.contentId,
                })
            }
            
            await this.trackFacebook('track', 'ViewContent', {
                content_ids: [info.contentId],
                content_name: info.name,
                content_category: info.category,
                currency: info.currency,
                value: info.value,
            })
            await this.trackContext({
                action: 'viewContent',
                context: info,
            })
        },
        async login(method) {
            console.log('Track login:', method)
            
            if (window.gtag) {
                window.gtag('event', 'login', { method })
            }
            await this.trackContext({
                action: 'login',
                context: method,
            })
        },
        async customizeProduct() {
            console.log('Track customize product')
            
            await this.trackFacebook('track', 'CustomizeProduct')
            await this.trackContext({
                action: 'customizeProduct',
                context: info,
            })
        },
    }
})