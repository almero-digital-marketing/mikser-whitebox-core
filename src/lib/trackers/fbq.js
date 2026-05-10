import { debounce, removeUndefined } from "../utils"
import { trackNone, trackSst } from "./track"

const name = 'fbq'
let trackNextPageView = true

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
            const fbc = 'fb.1.'+ (+new Date()) +'.'+ urlParams.get('fbclid')
            return fbc
        } else {
            return null
        }
    }
    return result[1]
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

async function trackInit(eventId, identities, options) {
    const fbp = getFbp()
    if (fbp) {
        identities.push({ id: 'fingerprint', name: 'fbp', value: fbp })
        console.log('Fbp:', name, fbp)
    }
    const fbc = getFbc()
    if (fbc) {
        identities.push({ id: 'fingerprint', name: 'fbc', value: fbc })
        console.log('Fbc:', name, fbp)
    }

    const userId = identities.find(({ name }) => name == 'userId')?.value
    if (userId) {
        if (Array.isArray(options.tracking.fbq)) {
            for (let fbq of options.tracking.fbq) {
                window.fbq('init', fbq, {
                    external_id: userId
                })
            }
        } else {
            window.fbq('init', options.tracking.fbq, {
                external_id: userId
            }) 
        }
    }
    trackNextPageView = true
    console.log('Track Init:', eventId, name, userId, options.tracking.fbq, identities)

    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    if (urlParams.has('utm_source')) {
        const source = urlParams.get('utm_source')
        const medium = urlParams.get('utm_medium')
        const campaign = urlParams.get('utm_campaign')

        console.log('Track utm:', eventId, name, source, medium, campaign)
        const event = 'Utm'+ source.charAt(0).toUpperCase() + source.slice(1)
        window.fbq('trackCustom', event, { source, medium, campaign}, { eventID: eventId })
    } 
}

async function trackIdentity(eventId, identities, options) {
    const userId = identities.find(({ name }) => name == 'userId')?.value
    const userData = removeUndefined({
        em: identities.find(({ name }) => name == 'email')?.value,
        ph: identities.find(({ name }) => name == 'e164')?.value.replace('+',''),
        fn: identities.find(({ name }) => name == 'firstname')?.value,
        ln: identities.find(({ name }) => name == 'lastname')?.value,
        db: identities.find(({ name }) => name == 'birthdate')?.value.replace(/\//g, ''),
        ge: identities.find(({ name }) => name == 'gender')?.value,
        country: identities.find(({ name }) => name == 'country')?.value,
        external_id: userId,
        client_ip_address: window.whitebox.services.connect.runtime.ip,
        client_user_agent: window.navigator.userAgent
    })
    if (Array.isArray(options.tracking.fbq)) {
        for (let fbq of options.tracking.fbq) {
            window.fbq('init', fbq, userData)
        }
    } else {
        window.fbq('init', options.tracking.fbq, userData) 
    }
    console.log('Track Identity:', eventId, name, userId)
}

async function trackPageView(eventId, context, identities) {
    const pathName = decodeURI(window.location.pathname)
    if (trackNextPageView) {
        context = {
            page_path: pathName
        }
        console.log('Track PageView:', eventId, name, pathName)
        window.fbq('track', 'PageView', context, { eventID: eventId })
        await trackSst(name, eventId, 'PageView', context, identities)
        trackNextPageView = false
    }
}

async function trackAddToCart(eventId, { items }, identities) {
    const context = items2fbq(items)
    console.log('Track AddToCart:', eventId, name, context)
    window.fbq('track', 'AddToCart', context, { eventID: eventId })
    await trackSst(name, eventId, 'AddToCart', context, identities)
}

async function trackAddToWishlist(eventId, { items }, identities) {
    const context = items2fbq(items)
    console.log('Track AddToWishlist:', eventId, name, items.map(item => item.name).join(', '))
    window.fbq('track', 'AddToWishlist', context, { eventID: eventId })
    await trackSst(name, eventId, 'AddToWishlist', context, identities)

}

async function trackCompleteRegistration(eventId, { method }, identities) {
    const context = { content_name: method }
    console.log('Track CompleteRegistration:', eventId, name, method)
    window.fbq('track', 'CompleteRegistration', context, { eventID: eventId })
    await trackSst(name, eventId, 'CompleteRegistration', context, identities)
}

async function trackLead(eventId, { currency, value, name: content, category }, identities) {
    const context = {
        content_name: content,
        content_category: category,
        currency: currency,
        value: value,
    }
    console.log('Track Lead:', eventId, name, currency, value, content)
    window.fbq('track', 'Lead', context, { eventID: eventId })
    await trackSst(name, eventId, 'Lead', context, identities)
}

async function trackContact(eventId, { name: content, category }, identities) {    
    const context = {
        content_name: content,
        content_category: category,
    }      
    console.log('Track Contact:', eventId, name, category, content)
    window.fbq('track', 'Contact', context, { eventID: eventId })
    await trackSst(name, eventId, 'Contact', context, identities)
}

async function trackFindLocation(eventId, { category, locationId }, identities) {
    const context = {
        content_category: category ? 'location_' + category : 'location',
        content_name: locationId
    }
    console.log('Track FindLocation:', eventId, name, category, locationId)
    window.fbq('track', 'FindLocation', context, { eventID: eventId })
    await trackSst(name, eventId, 'FindLocation', context, identities)
}

async function trackInitiateCheckout(eventId, { items }, identities) {
    const context = items2fbq(items)
    console.log('Track InitiateCheckout:', eventId, name, items?.map(item => item.name).join(', '))
    window.fbq('track', 'InitiateCheckout', context, { eventID: eventId })
    await trackSst(name, eventId, 'InitiateCheckout', context, identities)
}

async function trackPurchase(eventId, { items }, identities) {
    const context = items2fbq(items)
    console.log('Track Purchase:', eventId, name, items.map(item => item.name).join(', '))
    window.fbq('track', 'Purchase', context, { eventID: eventId })
    await trackSst(name, eventId, 'Purchase', context, identities)
}

async function trackSchedule(eventId, context, identities) {
    context = {}
    console.log('Track Schedule:', eventId, name)
    window.fbq('track', 'Schedule', context, { eventID: eventId })
    await trackSst(name, eventId, 'Schedule', context, identities)
}

async function trackSearch(eventId, { term }) {
    const context = { search_string: term }
    console.log('Track Search:', eventId, name, term)
    window.fbq('track', 'Search', context, { eventID: eventId })
    await trackSst(name, eventId, 'Search', context, identities)
}

async function trackStartTrial(eventId, { currency, value = 0, predictedLtv = 0 }, identities) {
    const context = { currency, value, predictedLtv }
    console.log('Track StartTrial:', eventId, name, currency, value, predictedLtv)
    window.fbq('track', 'StartTrial', context, { eventID: eventId })
    await trackSst(name, eventId, 'StartTrial', context, identities)
}

async function trackSubscribe(eventId, { currency, value = 0, predictedLtv = 0 }, identities) {
    const context = { currency, value, predictedLtv }
    console.log('Track Subscribe:', eventId, name, currency, value, predictedLtv)
    window.fbq('track', 'Subscribe', context, { eventID: eventId })
    await trackSst(name, eventId, 'Subscribe', context, identities)
}

async function trackViewContent(eventId, { category, name: content, contentId, currency, value }, identities) {
    const context =  { content_ids: [contentId], content_name: content, content_category: category, currency, value }
    console.log('Track ViewContent:', eventId, name, category, content, contentId, currency, value)
    window.fbq('track', 'ViewContent', context, { eventID: eventId })
    await trackSst(name, eventId, 'ViewContent', context, identities)
}

async function trackCustomizeProduct(eventId, context, identities) {
    context = {}
    console.log('Track CustomizeProduct:', eventId, name)
    window.fbq('track', 'CustomizeProduct', context, { eventID: eventId })
    await trackSst(name, eventId, 'CustomizeProduct', context, identities)
}

async function trackCustom(eventId, eventName, context = {}, identities) {
    console.log('Track Custom:', eventId, name, eventName, context)
    window.fbq('trackCustom', eventName, context, { eventID: eventId })
    await trackSst(name, eventId, eventName, context, identities)
}

export default function fbqTracker() {
    if (window.fbq) {
        return {
            name,
            trackInit,
            trackIdentity,
            trackPageView: debounce(trackPageView, 500),
            trackAddToCart,
            trackRemoveFromCart: (eventId) => trackNone(name, eventId, 'RemoveFromCart'),
            trackAddToWishlist,
            trackCompleteRegistration,
            trackLead,
            trackContact,
            trackFindLocation,
            trackInitiateCheckout,
            trackPurchase,
            trackSchedule,
            trackSearch,
            trackStartTrial,
            trackSubscribe,
            trackViewContent,
            trackLogin: (eventId) => trackNone(name, eventId, 'Login'),
            trackCustomizeProduct,
            trackCustom,
        }
    }
}