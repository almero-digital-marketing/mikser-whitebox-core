import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
axios.defaults.withCredentials = true

function items2gtag(items) {
    if (!items) return {}
    return items.map((item, index) => {
        return {
            items: {
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
                price: item.price,
                quantity: item.quantity || 1
            },
            currency: items[0].currency,
            value: items.reduce((sum, item) => sum + (item.quantity || 1) * (item.price - item.discount || 0), 0),
        }
    })
}

function items2fbq(items) {
    if (!items) return {}
    return {
        content_ids: items.map(item => item.itemId),
        content_type: 'product',
        contents: items.map(item => {
            return {
                id: item.itemId,
                quantity: item.quantity
            }
        }),
        content_name: items.map(item => item.name).join(', '),
        currency: items[0].currency,
        value: items.reduce((sum, item) => sum + (item.quantity || 1) * (item.price - item.discount || 0), 0),
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
    actions: {
        custom(action, data) {
            window.whitebox?.services?.analytics?.context(action, data) 
                || 
            window.whitebox?.init('analytics', analytics => analytics.service.context(action, data))
        },
        async pageView(path) {          
            console.log('Track page view:', decodeURI(path))
           
            if (window.gtag) {
                gtag('set', 'page_path', decodeURI(path))
                gtag('event', 'page_view')
            }

            if (window.fbq) {
                const eventId = uuidv4()
                fbq('track', 'PageView', {}, {
                    eventID: eventId
                })
                await trackServerSide({
                    event: 'PageView',
                    application: 'mikser',
                    action: 'pageView',
                    context: decodeURI(path),
                    eventId,
                    url: window.location.href
                })            
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
                gtag('event', 'add_to_cart', items2gtag(items))
            }
            
            if (window.fbq) {
                const eventId = uuidv4()
                fbq('track', 'AddToCart', items2fbq(items), { eventID: eventId })
                await trackServerSide({
                    event: 'AddToCart',
                    application: 'mikser',
                    action: 'addToCart',
                    context: items,
                    eventId,
                    url: window.location.href
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
                gtag('event', 'remove_from_cart', items2gtag(items))
            }

            await trackContext({
                action: 'removeFromCart',
                context: items,
            })

        },
        async addToWishlist(items) {
            console.log('Track add to wishlist:', items.map(item => item.name).join(', '))
            
            if (window.gtag) {
                gtag('event', 'add_to_wishlist', items2gtag(items))
            }
            
            if (window.fbq) {
                const eventId = uuidv4()
                fbq('track', 'AddToWishlist', items2fbq(items), { eventID: eventId })
                await trackServerSide({
                    event: 'AddToWishlist',
                    application: 'mikser',
                    action: 'addToWishlist',
                    context: items,
                    eventId,
                    url: window.location.href
                })
            }

            await trackContext({
                action: 'addToWishlist',
                context: items,
            })
        },
        async completeRegistration(method) {
            console.log('Track add to complete registration:', method)
            
            if (window.gtag) {
                gtag('event', 'sign_up', { method })
            }
            
            if (window.fbq) {
                const eventId = uuidv4()
                fbq('track', 'CompleteRegistration', { content_name: method }, { eventID: eventId })
                await trackServerSide({
                    event: 'CompleteRegistration',
                    application: 'mikser',
                    action: 'completeRegistration',
                    context: method,
                    eventId,
                    url: window.location.href
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
                gtag('event', 'generate_lead', { 
                    currency: info.currency,
                    value: info.value,
                })
            }
            
            if (window.fbq) {
                const eventId = uuidv4()
                fbq('track', 'Lead', {
                    content_name: info.name,
                    content_category: info.category,
                    currency: info.currency,
                    value: info.value,
                }, {
                    eventID: eventId,
                })
                await trackServerSide({
                    event: 'Lead',
                    application: 'mikser',
                    action: 'lead',
                    context: info,
                    eventId,
                    url: window.location.href
                })
            }

            await trackContext({
                action: 'lead',
                context: info,
            })
        },
        async contact() {           
            console.log('Track contact')
                    
            if (window.fbq) {
                const eventId = uuidv4()
                fbq('track', 'Contact', {}, {
                    eventID: eventId,
                })
                await trackServerSide({
                    event: 'Contact',
                    application: 'mikser',
                    action: 'contact',
                    eventId,
                    url: window.location.href
                })
            }
            await trackContext({
                action: 'contact',
                vaultId: analytics.runtime.vaultId
            })
        },
        async findLocation(locationId) {
            console.log('Track find location:', locationId)
            
            if (window.gtag) {
                gtag('event', 'select_content', { 
                    content_type: 'location',
                    item_id: locationId
                })
            }
            
            if (window.fbq) {
                const eventId = uuidv4()
                fbq('track', 'FindLocation', {}, {
                    eventID: eventId,
                })
                await trackServerSide({
                    event: 'FindLocation',
                    application: 'mikser',
                    action: 'findLocation',
                    eventId,
                    context: locationId,
                    url: window.location.href
                })           
            }
            await trackContext({
                action: 'findLocation',
                context: locationId,
            })
        },
        async initiateCheckout(items) {
            console.log('Track initiate checkout:', items?.map(item => item.name).join(', '))
            
            if (window.gtag) {
                gtag('event', 'begin_checkout', items2gtag(items))
            }
            
            if (window.fbq) {
                const eventId = uuidv4()
                fbq('track', 'InitiateCheckout', items2fbq(items), { eventID: eventId })
                await trackServerSide({
                    event: 'InitiateCheckout',
                    application: 'mikser',
                    action: 'initiateCheckout',
                    context: items,
                    eventId,
                    url: window.location.href
                })          
            }
            await trackContext({
                action: 'addToCart',
                context: items,
            })
        },
        async purchase(items) {
            console.log('Track purchase:', items.map(item => item.name).join(', '))
            
            if (window.gtag) {
                gtag('event', 'purchase', items2gtag(items))
            }
            
            if (window.fbq) {
                const eventId = uuidv4()
                fbq('track', 'Purchase', items2fbq(items), { eventID: eventId })
                await trackServerSide({
                    event: 'Purchase',
                    application: 'mikser',
                    action: 'purchase',
                    context: items,
                    eventId,
                    url: window.location.href
                })
            }
            await trackContext({
                action: 'addToCart',
                context: items,
            })
        },
        async schedule() {
            console.log('Track schedule')
                    
            if (window.fbq) {
                const eventId = uuidv4()
                fbq('track', 'Schedule', {}, { eventID: eventId })
                await trackServerSide({
                    event: 'Schedule',
                    application: 'mikser',
                    action: 'schedule',
                    eventId,
                    url: window.location.href
                })
            }
            await trackContext({
                action: 'contact',
            })
        },
        async search(term) {
            console.log('Track lead:', term)
            
            if (window.gtag) {
                gtag('event', 'search', { 
                    search_term: term,
                })
            }
            
            if (window.fbq) {
                const eventId = uuidv4()
                fbq('track', 'Search', { search_string: term }, { eventID: eventId })
                await trackServerSide({
                    event: 'Search',
                    application: 'mikser',
                    action: 'search',
                    context: term,
                    eventId,
                    url: window.location.href
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
                gtag('event', 'generate_lead', { 
                    currency: info.currency,
                    value: info.value,
                })
            }
            
            if (window.fbq) {
                const eventId = uuidv4()
                fbq('track', 'StartTrial', {
                    currency: info.currency,
                    value: info.value,
                    predicted_ltv: info.predictedLtv,
                }, { eventID: eventID })
                await trackServerSide({
                    event: 'StartTrial',
                    application: 'mikser',
                    action: 'startTrial',
                    context: info,
                    eventId,
                    url: window.location.href
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
                gtag('event', 'generate_lead', { 
                    currency: info.currency,
                    value: info.value || 0,
                })
            }
            
            if (window.fbq) {
                const eventId = uuidv4()
                fbq('track', 'Subscribe', {
                    currency: info.currency,
                    value: info.value || 0,
                    predicted_ltv: info.predictedLtv || 0,
                }, {
                    eventID: eventId
                })
                await trackServerSide({
                    event: 'Subscribe',
                    application: 'mikser',
                    action: 'subscribe',
                    context: info,
                    eventId,
                    url: window.location.href
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
                gtag('event', 'select_content', { 
                    content_type: info.category,
                    item_id: info.contentId,
                })
            }
            
            if (window.fbq) {
                const eventId = uuidv4()
                fbq('track', 'ViewContent', {
                    content_ids: [info.contentId],
                    content_name: info.name,
                    content_category: info.category,
                    currency: info.currency,
                    value: info.value,
                }, {
                    eventID: eventId
                })
                await trackServerSide({
                    event: 'ViewContent',
                    application: 'mikser',
                    action: 'viewContent',
                    context: info,
                    eventId,
                    url: window.location.href
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
                gtag('event', 'login', { method })
            }
            await trackContext({
                action: 'login',
                context: method,
            })
        },
    }
})