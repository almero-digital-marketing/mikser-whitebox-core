import { removeUndefined } from "../utils"
import { trackNone, trackSst } from "./track"

const name = 'ttq'

function items2ttq(items) {
    if (!items) return {}
    return items.map(item => ({
        content_id: item.itemId,
        content_name: item.name,
        content_type: 'product',
    }))
}

function getTtp() {
    for (const cookie of document.cookie.split(';')) {
        const [k,v] = cookie.split('=')
        if (k.trim() == '_ttp') return v
    }
}

function getTtclid() {
    for (const cookie of document.cookie.split(';')) {
        const [k,v] = cookie.split('=')
        if (k.trim() == 'ttclid') return v
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
    const ttclid = getTtclid()
    if (ttclid) {
        identities.push({ id: 'fingerprint', name: 'ttclid', value: ttclid })
        console.log('Ttclid:', name, ttclid)
    }
    const ttp = getTtp()
    if (ttp) {
        identities.push({ id: 'fingerprint', name: 'ttp', value: ttp })
        console.log('Ttp:', name, ttp)
    }
    console.log('Track Init:', eventId, name, options.tracking.ttq)
}

async function trackIdentity(eventId, identities) {
    const userId = identities.find(({ name }) => name == 'userId')?.value
    const userData = removeUndefined({
        email: identities.find(({ name }) => name == 'email')?.value,
        phone_number: identities.find(({ name }) => name == 'e164')?.value,
        external_id: userId
    })
    ttq.identify(userData)
    console.log('Track Identity:', eventId, name, userId)
}

async function trackAddToCart(eventId, { items }, identities) {
    const context = {
        value: items.reduce((sum, item) => sum + (item.quantity || 1) * ((item.price || 0) - (item.discount || 0)), 0).toFixed(2),
        currency: items[0]?.currency,
        contents: items2ttq(items)
    }
    console.log('Track AddToCart:', eventId, name)
    window.ttq.track('AddToCart', context, { event_id: eventId })
    await trackSst(name, eventId, 'AddToCart', context, identities)
}

async function trackAddToWishlist(eventId, { items }, identities) {
    const context = {
        contents: items2ttq(items),
    }
    console.log('Track AddToWishlist:', eventId, name, items.map(item => item.name).join(', '))
    window.ttq.track('AddToWishlist', context, { event_id: eventId })
    await trackSst(name, eventId, 'AddToWishlist', context, identities)
}

async function trackCompleteRegistration(eventId, { method }, identities) {
    const context = {
        method
    }
    console.log('Track CompleteRegistration:', eventId, name, method)
    window.ttq.track('CompleteRegistration', context, { event_id: eventId })
    await trackSst(name, eventId, 'CompleteRegistration', context, identities)
}

async function trackLead(eventId, context, identities) {
    context = {}
    console.log('Track Lead:', eventId, name)
    window.ttq.track('Lead', context, { event_id: eventId })
    await trackSst(name, eventId, 'Lead', context, identities)
}

async function trackContact(eventId, context, identities) {    
    context = {}   
    console.log('Track Contact:', eventId, name)
    window.ttq.track('Contact', {}, { event_id: eventId })
    await trackSst(name, eventId, 'Contact', context, identities)
}

async function trackFindLocation(eventId, context, identities) {
    context = {}   
    console.log('Track FindLocation:', eventId, name)
    window.ttq.track('FindLocation', context, { event_id: eventId })
    await trackSst(name, eventId, 'Contact', context, identities)
}

async function trackInitiateCheckout(eventId, context, identities) {
    context = {}   
    console.log('Track InitiateCheckout:', eventId, name)
    window.ttq.track('InitiateCheckout', context, { event_id: eventId })
    await trackSst(name, eventId, 'InitiateCheckout', context, identities)
}

async function trackPurchase(eventId, { items }, identities) {
    const context = {
        value: items.reduce((sum, item) => sum + (item.quantity || 1) * ((item.price || 0) - (item.discount || 0)), 0).toFixed(2),
        currency: items[0]?.currency,
        contents: items2ttq(items)
    }
    console.log('Track Purchase:', eventId, name, items.map(item => item.name).join(', '))
    window.ttq.track('Purchase', context, { event_id: eventId })
    await trackSst(name, eventId, 'Purchase', context, identities)
}

async function trackSchedule(eventId, context, identities) {
    context = {}   
    console.log('Track Schedule:', eventId, name)
    window.ttq.track('Schedule', context, { event_id: eventId })
    await trackSst(name, eventId, 'Schedule', context, identities)
}

async function trackSearch(eventId, { term }, identities) {
    const context = {
        query: term
    }
    console.log('Track Search:', eventId, name, term)
    window.ttq.track('InitiateCheckout', context, { event_id: eventId })
    await trackSst(name, eventId, 'InitiateCheckout', context, identities)
}

async function trackStartTrial(eventId, { currency, value }, identities) {
    const context = {
        currency,
        value
    }
    console.log('Track StartTrial:', eventId, name, currency, value)
    window.ttq.track('StartTrial', context, { event_id: eventId })
    await trackSst(name, eventId, 'StartTrial', context, identities)
}

async function trackSubscribe(eventId, { currency, value = 0 }, identities) {
    const context = {
        currency,
        value
    }
    console.log('Track Subscribe:', eventId, name, currency, value)
    console.log('Track Schedule:', eventId, name)
    window.ttq.track('Subscribe', context, { event_id: eventId })
    await trackSst(name, eventId, 'Subscribe', context, identities)
}

async function trackViewContent(eventId, { category, contentId }, identities) {
    const context = {
        content_type: 'product',
        content_id: contentId
    }
    console.log('Track ViewContent:', eventId, name, category, contentId)
    window.ttq.track('ViewContent', context, { event_id: eventId })
    await trackSst(name, eventId, 'ViewContent', context, identities)
}

async function trackCustomizeProduct(eventId, context, identities) {
    context = {}
    console.log('Track CustomizeProduct:', eventId, name)
    window.ttq.track('CustomizeProduct', context, { event_id: eventId })
    await trackSst(name, eventId, 'CustomizeProduct', context, identities)
}

async function trackCustom(eventId, eventName, context = {}, identities) {
    console.log('Track Custom:', eventId, name.toLowerCase(), eventName, context)
    window.ttq.track(eventName, context, { event_id: eventId })
    await trackSst(name, eventId, eventName, context, identities)
}

export default function ttqTracker() {
    if (window.ttq) {
        return {
            name,
            trackInit,
            trackIdentity,
            trackPageView: (eventId) => trackNone(name, eventId, 'PageView'),
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