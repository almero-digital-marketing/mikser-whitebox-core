import { debounce } from "../utils"
import { removeUndefined } from "../utils"

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
            fbc = 'fb.1.'+ (+new Date()) +'.'+ urlParams.get('fbclid')
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

    const userId = identities.find(({ name }) => name == 'userId').value
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
    const userId = identities.find(({ name }) => name == 'userId').value
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

async function trackPageView(eventId) {
    const pathName = decodeURI(window.location.pathname)
    if (trackNextPageView) {
        console.log('Track PageView:', eventId, name, pathName)
        window.fbq('track', 'PageView', { page_path: pathName }, { eventID: eventId })
        trackNextPageView = false
    }
}

async function trackAddToCart(eventId, { items }) {
    console.log('Track AddToCart:', eventId, name)
    window.fbq('track', 'AddToCart', items2fbq(items), { eventID: eventId })
}

async function trackAddToWishlist(eventId, { items }) {
    console.log('Track AddToWishlist:', eventId, name, items.map(item => item.name).join(', '))
    window.fbq('track', 'AddToWishlist', items2fbq(items), { eventID: eventId })
}

async function trackCompleteRegistration(eventId, { method }) {
    console.log('Track CompleteRegistration:', eventId, name, method)
    window.fbq('track', 'CompleteRegistration', { content_name: method }, { eventID: eventId })
}

async function trackLead(eventId, { currency, value, name: content, category }) {
    console.log('Track Lead:', eventId, name, currency, value, content)
    window.fbq('track', 'Lead', {
        content_name: content,
        content_category: category,
        currency: currency,
        value: value,
    }, { eventID: eventId })
}

async function trackContact(eventId, { name: content, category }) {           
    console.log('Track Contact:', eventId, name, category, content)
    window.fbq('track', 'Contact', {
        content_name: content,
        content_category: category,
    }, { eventID: eventId })
}

async function trackFindLocation(eventId, { category, locationId }) {
    console.log('Track FindLocation:', eventId, name, category, locationId)
    window.fbq('track', 'FindLocation', {
        content_category: category ? 'location_' + category : 'location',
        content_name: locationId
    }, { eventID: eventId })
}

async function trackInitiateCheckout(eventId, { items }) {
    console.log('Track InitiateCheckout:', eventId, name, items?.map(item => item.name).join(', '))
    window.fbq('track', 'InitiateCheckout', items2fbq(items), { eventID: eventId })
}

async function trackPurchase(eventId, { items }) {
    console.log('Track Purchase:', eventId, name, items.map(item => item.name).join(', '))
    window.fbq('track', 'Purchase', items2fbq(items), { eventID: eventId })
}

async function trackSchedule(eventId) {
    console.log('Track Schedule:', eventId, name)
    window.fbq('track', 'Schedule', {}, { eventID: eventId })
}

async function trackSearch(eventId, { term }) {
    console.log('Track Search:', eventId, name, term)
    window.fbq('track', 'Search', { search_string: term }, { eventID: eventId })
}

async function trackStartTrial(eventId, { currency, value = 0, predictedLtv = 0 }) {
    console.log('Track StartTrial:', eventId, name, currency, value, predictedLtv)
    window.fbq('track', 'StartTrial', { currency, value, predictedLtv }, { eventID: eventId })
}

async function trackSubscribe(eventId, { currency, value = 0, predictedLtv = 0 }) {
    console.log('Track Subscribe:', eventId, name, currency, value, predictedLtv)
    window.fbq('track', 'Subscribe', { currency, value, predictedLtv }, { eventID: eventId })
}

async function trackViewContent(eventId, { category, name: content, contentId, currency, value }) {
    console.log('Track ViewContent:', eventId, name, category, content, contentId, currency, value)
    window.fbq('track', 'ViewContent', { content_ids: [contentId], content_name: content, content_category: category, currency, value }, { eventID: eventId })
}

async function trackCustomizeProduct(eventId) {
    console.log('Track CustomizeProduct:', eventId, name)
    window.fbq('track', 'CustomizeProduct', {}, { eventID: eventId })
}

async function trackCustom(eventId, eventName, context = {}) {
    console.log('Track Custom:', eventId, name, eventName, context)
    window.fbq('trackCustom', eventName, context, { eventID: eventId })
}

async function trackNone(eventId, eventName) {
    console.log(`Track ${eventName} none:`, eventId, name)
}

export default function fbqTracker() {
    if (window.fbq) {
        return {
            name,
            trackInit,
            trackIdentity,
            trackPageView: debounce(trackPageView, 500),
            trackAddToCart,
            trackRemoveFromCart: (eventId) => trackNone(eventId, 'RemoveFromCart'),
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
            trackLogin: (eventId) => trackNone(eventId, 'Login'),
            trackCustomizeProduct,
            trackCustom,
        }
    }
}