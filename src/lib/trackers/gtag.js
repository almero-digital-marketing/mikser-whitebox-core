import { debounce, removeUndefined } from "../utils"
import { trackNone } from "./track"

const name = 'gtag'

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

async function trackInit(eventId, identities, options) {
    const userId = identities.find(({ name }) => name == 'userId').value
    window.gtag('js', new Date())
    if (Array.isArray(options.tracking.gtag)) {
        for(let gtag of options.tracking.gtag) {
            window.gtag('config', gtag, {
                user_id: userId
            })
        }
    } else {
        window.gtag('config', options.tracking.gtag, {
            user_id: userId
        })
    }
    console.log('Track Init:', eventId, name, userId, options.tracking.gtag)
}

async function trackIdentity(eventId, identities, options) {
    const userId = identities.find(({ name }) => name == 'userId').value
    if (Array.isArray(options.tracking.gtag)) {
        for(let tagId of options.tracking.gtag) {
            window.gtag('config', tagId, {
                user_id: userId,
                send_page_view: false,
            })
        }
    } else {
        window.gtag('config', options.tracking.gtag, {
            user_id: userId,
            send_page_view: false,
        })
    }
    window.gtag('set', 'user_data', removeUndefined({
        email: identities.find(({ name }) => name == 'email')?.value,
        phone_number: identities.find(({ name }) => name == 'e164')?.value,
        address: {
            first_name: identities.find(({ name }) => name == 'firstname')?.value,
            last_name: identities.find(({ name }) => name == 'lastname')?.value,
            city: identities.find(({ name }) => name == 'city')?.value,
            country: identities.find(({ name }) => name == 'country')?.value,
            region: identities.find(({ name }) => name == 'region')?.value,
            street: identities.find(({ name }) => name == 'street')?.value,
            postal_code: identities.find(({ name }) => name == 'postalcode')?.value,
        }
    }, false, 1))
    console.log('Track Identity:', eventId, name, userId)
}

async function trackPageView(eventId) {
    const pathName = decodeURI(window.location.pathname)
    window.gtag('set', 'page_path', pathName)
    window.gtag('event', 'page_view')
    console.log('Track PageView:', eventId, name, pathName)
}

async function trackAddToCart(eventId, { items }) {
    console.log('Track AddToCart:', eventId, name)
    window.gtag('event', 'add_to_cart', items2gtag(items))
}

async function trackRemoveFromCart(eventId, { items }) {
    console.log('Track RemoveFromCart:', eventId, name)
    window.gtag('event', 'remove_from_cart', items2gtag(items))
}

async function trackAddToWishlist(eventId, { items }) {
    console.log('Track AddToWishlist:', eventId, name, items.map(item => item.name).join(', '))
    window.gtag('event', 'add_to_wishlist', items2gtag(items))
}

async function trackCompleteRegistration(eventId, { method }) {
    console.log('Track CompleteRegistration:', eventId, name, method)
    window.gtag('event', 'sign_up', { method })
}

async function trackLead(eventId, { currency, value, name: content }) {
    console.log('Track Lead:', eventId, name, currency, value, content)
    window.gtag('event', 'generate_lead', { currency, value })
}

async function trackContact(eventId, { name: content, category }) {       
    console.log('Track Contact:', eventId, name, category, content)
    window.gtag('event', 'contact', {
        event_label: content,
        event_category: category,
    })
}

async function trackFindLocation(eventId, { category, locationId }) {
    console.log('Track FindLocation:', eventId, name, category, locationId)
    window.gtag('event', 'select_content', { 
        content_type: category ? 'location_' + category : 'location',
        item_id: locationId
    })
}

async function trackInitiateCheckout(eventId, { items }) {
    console.log('Track InitiateCheckout:', eventId, name, items?.map(item => item.name).join(', '))
    window.gtag('event', 'begin_checkout', items2gtag(items))
}

async function trackPurchase(eventId, { items }) {
    console.log('Track Purchase:', eventId, name, items.map(item => item.name).join(', '))
    window.gtag('event', 'purchase', items2gtag(items))
}

async function trackSearch(eventId, { term }) {
    console.log('Track Search:', eventId, name, term)
    window.gtag('event', 'search', { search_term: term})
}

async function trackStartTrial(eventId, { currency, value }) {
    console.log('Track StartTrial:', eventId, name, currency, value)
    window.gtag('event', 'generate_lead', { currency, value })
}

async function trackSubscribe(eventId, { currency, value = 0 }) {
    console.log('Track Subscribe:', eventId, name, currency, value)
    window.gtag('event', 'generate_lead', { currency, value })
}

async function trackViewContent(eventId, { category, contentId }) {
    console.log('Track ViewContent:', eventId, name, category, contentId)
    window.gtag('event', 'select_content', { content_type: category, item_id: contentId })
}

async function trackLogin(eventId, { method}) {
    console.log('Track Login:', eventId, name, method)
    window.gtag('event', 'login', { method })
}

async function trackCustom(eventId, eventName, context = {}) {
    console.log('Track Custom:', eventId, name.toLowerCase(), eventName, context)
    window.gtag('event', eventName, context)
}

export default function fbqTracker() {
    if (window.gtag) {
        return {
            name,
            trackInit,
            trackIdentity,
            trackPageView: debounce(trackPageView, 500),
            trackAddToCart,
            trackRemoveFromCart,
            trackAddToWishlist,
            trackCompleteRegistration,
            trackLead,
            trackContact,
            trackFindLocation,
            trackInitiateCheckout,
            trackPurchase,
            trackSchedule: (eventId) => trackNone(name, eventId, 'Schedule'),
            trackSearch,
            trackStartTrial,
            trackSubscribe,
            trackViewContent,
            trackLogin,
            trackCustomizeProduct: (eventId) => trackNone(name, eventId, 'CustomizeProduct'),
            trackCustom,
        }
    }
}