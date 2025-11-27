import { removeUndefined } from "../utils"

const name = 'ttq'

function items2ttq(items) {
    if (!items) return {}
    return {
        content_id: item.itemId,
        content_name: item.name,
        content_type: 'product',
    }
}


async function trackInit(eventId, identities, options) {
    if (Array.isArray(options.tracking.ttq)) {
        for(let ttq of options.tracking.ttq) {
            window.ttq.load(ttq)
        }
    } else {
        window.ttq.load(options.tracking.ttq)
    }
    window.ttq.page()
    console.log('Track Init:', eventId, name, options.tracking.ttq)
}

async function trackIdentity(eventId, identities) {
    const userId = identities.find(({ name }) => name == 'userId').value
    const userData = removeUndefined({
        email: identities.find(({ name }) => name == 'email')?.value,
        phone_number: identities.find(({ name }) => name == 'e164')?.value,
        external_id: userId
    })
    ttq.identify(userData)
    console.log('Track Identity:', eventId, name, userId)
}

async function trackAddToCart(eventId, { items }) {
    console.log('Track AddToCart:', eventId, name)
    window.ttq.track('AddToCart', {
        value: items.reduce((sum, item) => sum + (item.quantity || 1) * ((item.price || 0) - (item.discount || 0)), 0).toFixed(2),
        currency: items[0]?.currency,
        contents: items2ttq(items)
    }, { event_id: eventId })
}

async function trackAddToWishlist(eventId, { items }) {
    console.log('Track AddToWishlist:', eventId, name, items.map(item => item.name).join(', '))
    window.ttq.track('AddToWishlist', {
        contents: items2ttq(items),
    }, { event_id: eventId })
}

async function trackCompleteRegistration(eventId, { method }) {
    console.log('Track CompleteRegistration:', eventId, name, method)
    window.ttq.track('CompleteRegistration', {
        method
    }, { event_id: eventId })
}

async function trackLead(eventId) {
    console.log('Track Lead:', eventId, name)
    window.ttq.track('Lead', {}, { event_id: eventId })
}

async function trackContact(eventId) {       
    console.log('Track Contact:', eventId, name)
    window.ttq.track('Contact', {}, { event_id: eventId })
}

async function trackFindLocation(eventId) {
    console.log('Track FindLocation:', eventId, name)
    window.ttq.track('FindLocation', {}, { event_id: eventId })
}

async function trackInitiateCheckout(eventId) {
    console.log('Track InitiateCheckout:', eventId, name)
    window.ttq.track('InitiateCheckout', {}, { event_id: eventId })
}

async function trackPurchase(eventId, { items }) {
    console.log('Track Purchase:', eventId, name, items.map(item => item.name).join(', '))
    window.ttq.track('Purchase', {
        value: items.reduce((sum, item) => sum + (item.quantity || 1) * ((item.price || 0) - (item.discount || 0)), 0).toFixed(2),
        currency: items[0]?.currency,
        contents: items2ttq(items)
    }, { event_id: eventId })
}

async function trackSchedule(eventId) {
    console.log('Track Schedule:', eventId, name)
    window.ttq.track('Schedule', {}, { event_id: eventId })
}

async function trackSearch(eventId, { term }) {
    console.log('Track Search:', eventId, name, term)
    window.ttq.track('InitiateCheckout', {
        query: term
    }, { event_id: eventId })
}

async function trackStartTrial(eventId, { currency, value }) {
    console.log('Track StartTrial:', eventId, name, currency, value)
    window.ttq.track('InitiateCheckout', {
        currency,
        value
    }, { event_id: eventId })
}

async function trackSubscribe(eventId, { currency, value = 0 }) {
    console.log('Track Subscribe:', eventId, name, currency, value)
    console.log('Track Schedule:', eventId, name)
    window.ttq.track('Subscribe', {}, { event_id: eventId })
}

async function trackViewContent(eventId, { category, contentId }) {
    console.log('Track ViewContent:', eventId, name, category, contentId)
    window.ttq.track('Subscribe', {
        content_type: category,
        content_id: contentId
    }, { event_id: eventId })
}

async function trackCustomizeProduct(eventId) {
    console.log('Track CustomizeProduct:', eventId, name)
    window.ttq.track('CustomizeProduct', {}, { event_id: eventId })
}

async function trackCustom(eventId, eventName, context = {}) {
    console.log('Track Custom:', eventId, name.toLowerCase(), eventName, context)
    window.ttq.track(eventName, context, { event_id: eventId })
}

async function trackNone(eventId, eventName) {
    console.log(`Track ${eventName} none:`, eventId, name)
}

export default function ttqTracker() {
    if (window.ttq) {
        return {
            name,
            trackInit,
            trackIdentity,
            trackPageView: (eventId) => trackNone(eventId, 'PageView'),
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