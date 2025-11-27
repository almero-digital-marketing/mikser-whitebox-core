import axios from 'axios'

const name = 'sst'

async function track(eventId, eventName, context = {}, identities) {
    const { connect } = window.whitebox.services
    let data = {
        event: eventName,
        eventId,
        context,
        url: window.location.href,
        timestamp: Date.now(),
    }   
    const userId = identities.find(({ name }) => name == 'userId').value
    data.identities = [ 
        ...identities, 
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
        }).catch(err => console.error('Track error:', eventId, name, err))
        console.log(`Track ${eventName}:`, eventId, name, context)
    }  
}

async function trackNone(eventId, eventName) {
    console.log(`Track ${eventName} none:`, eventId, name)
}

export default function sstTracker() {
    return {
        name,
        trackInit: (eventId) => trackNone(eventId, 'Init'),
        trackIdentity: (eventId) => trackNone(eventId, 'Identity'),
        trackPageView: (eventId, context, identities) => track(eventId, 'PageView', context, identities),
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
