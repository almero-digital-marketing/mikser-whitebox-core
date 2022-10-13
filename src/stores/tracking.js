import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
axios.defaults.withCredentials = true

function sha256(val) {
    if (typeof val == 'object') {
        val = JSON.stringify(val)
    }
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
        if(window.location.search.includes('fbclid=')){
            const queryString = window.location.search
            const urlParams = new URLSearchParams(queryString)
            fbc = 'fb.1.'+ (+new Date()) +'.'+ urlParams.get('fbclid')
        } else {
            return null
        }
    }
    return result[1];
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
        trackServerSide(data = {}) {         
            const { connect } = window.whitebox.services
            data.timestamp = Date.now()
            data.identities = { 
                ...this.identities, 
                userId: localStorage.getItem('whiteboxUserId') || connect.runtime.fingerprint 
            }
            if (connect.runtime.sst) {
                axios.post(`${connect.runtime.url}/track`, data, {
                    headers: {
                        'Authorization': 'Bearer ' + connect.runtime.tokens.connect,
                        'Fingerprint': connect.runtime.fingerprint,
                    }
                }).catch(console.error)
            }  
        },
        trackContext(data = {}) {  
            window.whitebox?.init('analytics', analytics => {
                if (analytics) {
                    const { analytics } = window.whitebox.services
                    data.vaultId = analytics.runtime.vaultId
                   
                    axios.post(`${analytics.runtime.url}/context`, data, {
                        headers: {
                            'Authorization': 'Bearer ' + analytics.runtime.token,
                            'Fingerprint': analytics.runtime.fingerprint,
                        }
                    }).catch(console.error)
                }
            })
        },
        async identity(identities, userName = 'email') {
            if (!window.whitebox) return
            const { connect } = window.whitebox.services
            let userId = connect.runtime.fingerprint
            
            return axios.post(`${connect.runtime.url}/identity`, {
                identities
            }, {
                headers: {
                    'Authorization': 'Bearer ' + connect.runtime.tokens.connect,
                    'Fingerprint': connect.runtime.fingerprint,
                }
            })
            .then((response) => {
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
                        userId = sha256(userInfo)
                        localStorage.setItem('whiteboxUserId', userId)
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
            let userId = localStorage.getItem('whiteboxUserId') || connect.runtime.fingerprint

            if (window.fbq) {
                const eventId = uuidv4()
                const context = {}

                const fbp = getFbp()
                if (fbp) {
                    this.identities.push({ id: 'fingerprint', name: 'fbp', value: fbp })
                }
                const fbc = getFbc()
                if (fbc) {
                    this.identities.push({ id: 'fingerprint', name: 'fbc', value: fbc })
                }

                window.fbq('init', this.options.fbq, {
                    external_id: userId
                })
                window.fbq('track', 'PageView', {}, {
                    eventID: eventId
                })
                await this.trackServerSide({
                    event: 'PageView',
                    context,
                    eventId,
                    url: window.location.href,
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

            const queryString = window.location.search
            const urlParams = new URLSearchParams(queryString)
            if (urlParams.has('utm_source')) {
                const source = urlParams.get('utm_source')
                const medium = urlParams.get('utm_medium')
                const campaign = urlParams.get('utm_campaign')

                console.log('Track utm:', source, medium, campaign)

                if (window.fbq) {
                    const eventId = uuidv4()
                    let event = 'Utm'+ source.charAt(0).toUpperCase() + source.slice(1)
                    const context = {
                        source,
                        medium,
                        campaign,
                    }
                    window.fbq('trackCustom', event, context, { eventID: eventId })
                    await this.trackServerSide({
                        event,
                        context,
                        eventId,
                        url: window.location.href,
                    })
                }
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
            
            if (window.fbq) {
                const eventId = uuidv4()
                const context = items2fbq(items)
                window.fbq('track', 'AddToCart', context, { eventID: eventId })
                await this.trackServerSide({
                    event: 'AddToCart',
                    eventId,
                    context,
                    url: window.location.href,
                })
            }

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
            
            if (window.fbq) {
                const eventId = uuidv4()
                const context = items2fbq(items)
                window.fbq('track', 'AddToWishlist', context, { eventID: eventId })
                await this.trackServerSide({
                    event: 'AddToWishlist',
                    eventId,
                    context,
                    url: window.location.href,
                })
            }

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
            
            if (window.fbq) {
                const eventId = uuidv4()
                const context = { content_name: method }
                window.fbq('track', 'CompleteRegistration', context, { eventID: eventId })
                await this.trackServerSide({
                    event: 'CompleteRegistration',
                    context,
                    eventId,
                    url: window.location.href,
                })
            }
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
            
            if (window.fbq) {
                const eventId = uuidv4()
                const context = {
                    content_name: info.name,
                    content_category: info.category,
                    currency: info.currency,
                    value: info.value,
                }
                window.fbq('track', 'Lead', context, { eventID: eventId })
                await this.trackServerSide({
                    event: 'Lead',
                    context,
                    eventId,
                    url: window.location.href,
                })
            }

            await this.trackContext({
                action: 'lead',
                context: info,
            })
        },
        async contact(identities) {           
            console.log('Track contact')
                    
            if (window.fbq) {
                const eventId = uuidv4()
                const context = {}
                window.fbq('track', 'Contact', context, {
                    eventID: eventId,
                })
                await this.trackServerSide({
                    event: 'Contact',
                    context,
                    eventId,
                    url: window.location.href,
                })
            }
            await this.trackContext({
                action: 'contact',
                context: {}
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
            
            if (window.fbq) {
                const eventId = uuidv4()
                const context = {
                    content_category: location.category ? 'location_' + location.category : 'location',
                    content_name: location.locationId
                }
                window.fbq('track', 'FindLocation', context, { eventID: eventId })
                await this.trackServerSide({
                    event: 'FindLocation',
                    eventId,
                    context,
                    url: window.location.href,
                })           
            }
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
            
            if (window.fbq) {
                const eventId = uuidv4()
                const context = items2fbq(items)
                window.fbq('track', 'InitiateCheckout', context, { eventID: eventId })
                await this.trackServerSide({
                    event: 'InitiateCheckout',
                    eventId,
                    context,
                    url: window.location.href,
                })          
            }
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
            
            if (window.fbq) {
                const eventId = uuidv4()
                const context = items2fbq(items)
                context.transaction_id = eventId
                window.fbq('track', 'Purchase', context, { eventID: eventId })
                await this.trackServerSide({
                    event: 'Purchase',
                    eventId,
                    context,
                    url: window.location.href,
                })
            }
            await this.trackContext({
                action: 'purchase',
                context: items,
            })
        },
        async schedule() {
            console.log('Track schedule')
                    
            if (window.fbq) {
                const eventId = uuidv4()
                const context = {}
                window.fbq('track', 'Schedule', context, { eventID: eventId })
                await this.trackServerSide({
                    event: 'Schedule',
                    eventId,
                    context,
                    url: window.location.href,
                })
            }
            await this.trackContext({
                action: 'contact',
            })
        },
        async search(term) {
            console.log('Track lead:', term)
            
            if (window.gtag) {
                window.gtag('event', 'search', { 
                    search_term: term,
                })
            }
            
            if (window.fbq) {
                const eventId = uuidv4()
                const context = { search_string: term }
                window.fbq('track', 'Search', context, { eventID: eventId })
                await this.trackServerSide({
                    event: 'Search',
                    context,
                    eventId,
                    url: window.location.href,
                })
            }
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
            
            if (window.fbq) {
                const eventId = uuidv4()
                const context =  {
                    currency: info.currency,
                    value: info.value,
                    predicted_ltv: info.predictedLtv,
                }
                window.fbq('track', 'StartTrial', context, { eventID: eventID })
                await this.trackServerSide({
                    event: 'StartTrial',
                    context,
                    eventId,
                    url: window.location.href,
                })
            }
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
            
            if (window.fbq) {
                const eventId = uuidv4()
                const context = {
                    currency: info.currency,
                    value: info.value || 0,
                    predicted_ltv: info.predictedLtv || 0,
                }
                window.fbq('track', 'Subscribe', context, { eventID: eventId })
                await this.trackServerSide({
                    event: 'Subscribe',
                    context,
                    eventId,
                    url: window.location.href,
                })
            }
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
            
            if (window.fbq) {
                const eventId = uuidv4()
                const context = {
                    content_ids: [info.contentId],
                    content_name: info.name,
                    content_category: info.category,
                    currency: info.currency,
                    value: info.value,
                }
                window.fbq('track', 'ViewContent', context, { eventID: eventId })
                await this.trackServerSide({
                    event: 'ViewContent',
                    context,
                    eventId,
                    url: window.location.href,
                })
            }
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
            
            if (window.fbq) {
                const eventId = uuidv4()
                const context = {}
                window.fbq('track', 'CustomizeProduct', context, { eventID: eventId })
                await this.trackServerSide({
                    event: 'CustomizeProduct',
                    context,
                    eventId,
                    url: window.location.href,
                })
            }
            await this.trackContext({
                action: 'subscribe',
                context: info,
            })
        },
    }
})