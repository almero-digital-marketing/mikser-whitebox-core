import { removeUndefined } from "../utils"
import { trackNone } from "./track"

const name = 'mixpanel'

async function trackInit(eventId, identities, options) {
    if (Array.isArray(options.tracking.mixpanel)) {
        for(let mixpanel of options.tracking.mixpanel) {
            window.mixpanel.init(mixpanel.token, {
                autocapture: true,
                record_sessions_percent: mixpanel.record_sessions_percent || 100,
                api_host: mixpanel.api_host,
            })
        }
    } else {
        window.mixpanel.init(options.tracking.mixpanel.token, {
            autocapture: true,
            record_sessions_percent: options.tracking.mixpanel.record_sessions_percent || 100,
            api_host: options.tracking.mixpanel.api_host,
        })
    }
    console.log('Track Init:', eventId, name, options.tracking.mixpanel)
}

async function track(eventId, eventName, context = {}) {
    window.mixpanel.track(eventName, context)
    console.log(`Track ${eventName}:`, eventId, name, context)
}

async function trackIdentity(eventId, identities) {
    const userId = identities.find(({ name }) => name == 'userId')?.value
    const person = removeUndefined({
        $email: identities.find(({ name }) => name == 'email')?.value,
        $name: identities.find(({ id }) => id == 'name')?.value,
        $phone: identities.find(({ name }) => name == 'e164')?.value || identities.find(({ id }) => id == 'phone')?.value,
    })
    for (let identify of identities) {
        if (identify.id != 'fingerprint' && identify.name != 'phone' && identify.name != 'email' && identify.name != 'name') {
            person['person_' + identify.name] = identify.value
        }
    }
    if (person.$name || person.$email || person.$phone) {
        if (userId) window.mixpanel.identify(userId)
        window.mixpanel.people.set(person)
    }
    console.log('Track Identity:', eventId, name, userId)
}

export default function sstTracker() {
    return {
        name,
        trackInit,
        trackIdentity,
        trackPageView: (eventId) => trackNone(name, eventId, 'PageView'),
        trackAddToCart: (eventId, context, identities) => track(eventId, 'AddToCart', context, identities),
        trackRemoveFromCart: (eventId, context, identities) => track(eventId, 'RemoveFromCart', context, identities),
        trackAddToWishlist: (eventId, context, identities) => track(eventId, 'AddToWishlist', context, identities),
        trackCompleteRegistration: (eventId, context, identities) => track(eventId, 'CompleteRegistration', context, identities),
        trackLead: (eventId, context, identities) => track(eventId, 'Lead', context, identities),
        trackContact: (eventId, context, identities) => track(eventId, 'Contact', context, identities),
        trackFindLocation: (eventId, context, identities) => track(eventId, 'FindLocation', context, identities),
        trackInitiateCheckout: (eventId, context, identities) => track(eventId, 'InitiateCheckout', context, identities),
        trackPurchase: (eventId, context, identities) => track(eventId, 'Purchase', context, identities),
        trackSchedule: (eventId, context, identities) => track(eventId, 'Schedule', context, identities),
        trackSearch: (eventId, context, identities) => track(eventId, 'Search', context, identities),
        trackStartTrial: (eventId, context, identities) => track(eventId, 'StartTrial', context, identities),
        trackSubscribe: (eventId, context, identities) => track(eventId, 'Subscribe', context, identities),
        trackViewContent: (eventId, context, identities) => track(eventId, 'ViewContent', context, identities),
        trackLogin: (eventId, context, identities) => track(eventId, 'Login', context, identities),
        trackCustomizeProduct: (eventId, context, identities) => track(eventId, 'CustomizeProduct', context, identities),
        trackCustom: (eventId, eventName, context, identities) => track(eventId, eventName, context, identities),
    }
}
