import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
axios.defaults.withCredentials = true

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

async function trackServerSide(data) {
    if (!window.whitebox) return
    const { connect } = window.whitebox.services
    if (connect.runtime.sst) {
        await axios.post(`${connect.runtime.url}/track`, data, {
            headers: {
                'Authorization': 'Bearer ' + connect.runtime.tokens.connect,
                'Fingerprint': connect.runtime.fingerprint,
            }
        })
    }         
}

async function trackContext(data) {  
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
        }
    })
}

export const useWhiteboxTracking = defineStore('whitebox-tracking', {
    state: () => {
        return {
            identities: {},
            options: {}
        }
    },
    actions: {
        async identity(identities) {
            let diff = false
            for (let key in identities) {
                if (this.identities[key] != identities[key]) {
                    diff = true
                    break
                }
            }
            if (diff) {
                console.log('Track identity')
                if (window.fbq) {
                    if (identities.name) {
                        identities.firstName = identities.name.split(' ')[0]
                        identities.lastName = identities.name.replace(identities.firstName + ' ', '')
                    }
                    window.fbq('init', this.options.fbq, {
                        em: identities.email,
                        ph: identities.first,
                        fn: identities.firstName,
                        ln: identities.lastName,
                        db: identities.birthdate?.toString().replace(/\//g, ''),
                        ge: identities.gender,
                        country: identities.country
                    })
                }
            }
            this.identities = identities
        },
        async start(options) {
            if (options) {
                this.options = options
            }
            if (window.fbq) {
                const eventId = uuidv4()
                const context = {}
                window.fbq('init', this.options.fbq, {})
                window.fbq('track', 'PageView', {}, {
                    eventID: eventId
                })
                await trackServerSide({
                    event: 'PageView',
                    context,
                    eventId,
                    url: window.location.href,
                })            
            }

            if (window.gtag) {
                window.gtag('js', new Date());
                window.gtag('config', this.options.gtag);    
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
                    await trackServerSide({
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
                await trackServerSide({
                    event: 'AddToCart',
                    eventId,
                    context,
                    url: window.location.href,
                    identities: this.identities
                })
            }

            await trackContext({
                action: 'addToCart',
                context: items,
            })
        },
        async removeFromCart(items) {
            console.log('Track remove from cart:', items.map(item => item.name).join(', '))
           
            if (window.gtag) {
                window.gtag('event', 'remove_from_cart', items2gtag(items))
            }

            await trackContext({
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
                await trackServerSide({
                    event: 'AddToWishlist',
                    eventId,
                    context,
                    url: window.location.href,
                    identities: this.identities
                })
            }

            await trackContext({
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
                await trackServerSide({
                    event: 'CompleteRegistration',
                    context,
                    eventId,
                    url: window.location.href,
                    identities: this.identities
                })
            }
            await trackContext({
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
                await trackServerSide({
                    event: 'Lead',
                    context,
                    eventId,
                    url: window.location.href,
                    identities: this.identities
                })
            }

            await trackContext({
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
                await trackServerSide({
                    event: 'Contact',
                    context,
                    eventId,
                    url: window.location.href,
                    identities: this.identities
                })
            }
            await trackContext({
                action: 'contact',
                vaultId: analytics.runtime.vaultId
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
                await trackServerSide({
                    event: 'FindLocation',
                    eventId,
                    context,
                    url: window.location.href,
                    identities: this.identities
                })           
            }
            await trackContext({
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
                await trackServerSide({
                    event: 'InitiateCheckout',
                    eventId,
                    context,
                    url: window.location.href,
                    identities: this.identities
                })          
            }
            await trackContext({
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
                await trackServerSide({
                    event: 'Purchase',
                    eventId,
                    context,
                    url: window.location.href,
                    identities: this.identities
                })
            }
            await trackContext({
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
                await trackServerSide({
                    event: 'Schedule',
                    eventId,
                    context,
                    url: window.location.href,
                    identities: this.identities
                })
            }
            await trackContext({
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
                await trackServerSide({
                    event: 'Search',
                    context,
                    eventId,
                    url: window.location.href,
                    identities: this.identities
                })
            }
            await trackContext({
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
                await trackServerSide({
                    event: 'StartTrial',
                    context,
                    eventId,
                    url: window.location.href,
                    identities: this.identities
                })
            }
            await trackContext({
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
                await trackServerSide({
                    event: 'Subscribe',
                    context,
                    eventId,
                    url: window.location.href,
                    identities: this.identities
                })
            }
            await trackContext({
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
                await trackServerSide({
                    event: 'ViewContent',
                    context,
                    eventId,
                    url: window.location.href,
                    identities: this.identities
                })
            }
            await trackContext({
                action: 'viewContent',
                context: info,
            })
        },
        async login(method) {
            console.log('Track login:', method)
            
            if (window.gtag) {
                window.gtag('event', 'login', { method })
            }
            await trackContext({
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
                await trackServerSide({
                    event: 'CustomizeProduct',
                    context,
                    eventId,
                    url: window.location.href,
                    identities: this.identities
                })
            }
            await trackContext({
                action: 'subscribe',
                context: info,
            })
        },
    }
})