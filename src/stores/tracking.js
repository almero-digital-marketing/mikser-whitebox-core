import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import { sha256, localKey } from '../lib/utils.js'
import fbqTracker from '../lib/trackers/fbq.js'
import gtagTracker from '../lib/trackers/gtag.js'
import sstTracker from '../lib/trackers/sst.js'
import mixpanelTracker from '../lib/trackers/mixpanel.js'
import ttqTracker from '../lib/trackers/ttq.js'
import PQueue from 'p-queue'

axios.defaults.withCredentials = true
const queue = new PQueue({concurrency: 1})
const trackers = [
    fbqTracker(),
    gtagTracker(),
    ttqTracker(),
    mixpanelTracker(),
    sstTracker(),
]

async function track(tracking, callback) {
    const eventId = uuidv4()
    for (const tracker of trackers) {
        if (tracker && tracking[tracker.name]) {
            await callback(tracker, eventId)
        }
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
        async identity(identities, userName = 'email') {
            if (!window.whitebox) return
            const { connect } = window.whitebox.services
            let userId = await sha256(connect.runtime.fingerprint)
            
            return axios.post(`${connect.runtime.url}/identity`, {
                identities
            }, {
                headers: {
                    'Authorization': 'Bearer ' + connect.runtime.tokens.connect,
                    'Fingerprint': connect.runtime.fingerprint,
                }
            })
            .then(async response => {
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
                        userId = await sha256(userInfo)
                        localStorage.setItem(localKey('whiteboxUserId'), userId)
                    }
                }
                if (diff) {
                    await track(this.options.tracking, (tracker, eventId) => tracker.trackIdentity(eventId, this.identities, this.options))
                }
            })

        },
        async start() {
            queue.add(async () => {
                console.log('Tracking start:', window.whitebox, this.options.tracking)
                await new Promise(resolve => {
                    window.whitebox?.init('analytics', async () => {
                        const { connect } = window.whitebox.services
                        let userId = localStorage.getItem(localKey('whiteboxUserId')) || await sha256(connect.runtime.fingerprint)
                        this.identities.push({ id: 'fingerprint', name: 'userId', value: userId })
                        await track(this.options.tracking, (tracker, eventId) => tracker.trackInit(eventId, this.identities, this.options))
                        resolve()
                    })
                })
                await this.pageView()
                await this.session()

                await new Promise(resolve => {
                    if (!window.whitebox?.services?.shortener) return resolve()
                    window.whitebox?.init('shortener', shortener => {
                        if (shortener?.service.data?.email || shortener?.service.data?.phone) {
                            this.contact(shortener.service.data)
                        }
                        resolve()
                    })
                })
            })    
        },
        async custom(action, context) {
            queue.add(async () => {
                await track(this.options.tracking, (tracker, eventId) => tracker.trackCustom(eventId, context, this.identities, this.options))
                await new Promise(resolve => {
                    window.whitebox?.init('analytics', analytics => {
                        analytics.service.context(action, context)
                        resolve()
                    })
                })
            })
        },
        async pageView() {   
            queue.add(async () => {       
                await track(this.options.tracking, (tracker, eventId) => tracker.trackPageView(eventId, {}, this.identities, this.options))
                await new Promise(resolve => {
                    window.whitebox?.init('analytics', analytics => {
                        analytics?.service.info()
                        resolve()
                    })
                })
            })
        },
        async addToCart(items) {     
            queue.add(async () => { 
                await track(this.options.tracking, (tracker, eventId) => tracker.trackAddToCart(eventId, { items }, this.identities, this.options))
            })
        },
        async removeFromCart(items) {
            queue.add(async () => {
                await track(this.options.tracking, (tracker, eventId) => tracker.trackRemoveFromCart(eventId, { items }, this.identities, this.options))
            })
        },
        async addToWishlist(items) {
            queue.add(async () => {
                await track(this.options.tracking, (tracker, eventId) => tracker.trackAddToWishlist(eventId, { items }, this.identities, this.options))
            })
        },
        async completeRegistration(method) {
            queue.add(async () => {
                await track(this.options.tracking, (tracker, eventId) => tracker.trackCompleteRegistration(eventId, { method }, this.identities, this.options))
            })
        },
        async lead(context) {
            queue.add(async () => {
                await track(this.options.tracking, (tracker, eventId) => tracker.trackLead(eventId, context, this.identities, this.options))
            })
        },
        async contact(context) {    
            queue.add(async () => {
                await track(this.options.tracking, (tracker, eventId) => tracker.trackContact(eventId, context, this.identities, this.options))
            })
        },
        async findLocation(context) {
            queue.add(async () => {
                await track(this.options.tracking, (tracker, eventId) => tracker.trackFindLocation(eventId, context, this.identities, this.options))
            })
        },
        async initiateCheckout(items) {
            queue.add(async () => {
                await track(this.options.tracking, (tracker, eventId) => tracker.trackInitiateCheckout(eventId, { items }, this.identities, this.options))
            })
        },
        async purchase(items) {
            queue.add(async () => {
                await track(this.options.tracking, (tracker, eventId) => tracker.trackPurchase(eventId, { items }, this.identities, this.options))
            })
        },
        async schedule() {
            queue.add(async () => {
                await track(this.options.tracking, (tracker, eventId) => tracker.trackSchedule(eventId, {}, this.identities, this.options))
            })
        },
        async search(term) {
            queue.add(async () => {
                await track(this.options.tracking, (tracker, eventId) => tracker.trackSearch(eventId, { term }, this.identities, this.options))
            })
        },
        async startTrial(context) {
            queue.add(async () => {
                await track(this.options.tracking, (tracker, eventId) => tracker.trackSearch(eventId, context, this.identities, this.options))
            })
        },
        async subscribe(context) {
            queue.add(async () => {
                await track(this.options.tracking, (tracker, eventId) => tracker.trackSubscribe(eventId, context, this.identities, this.options))
            })
        },
        async viewContent(context) {
            queue.add(async () => {
                await track(this.options.tracking, (tracker, eventId) => tracker.trackViewContent(eventId, context, this.identities, this.options))
            })
        },
        async login(method) {
            queue.add(async () => {
                await track(this.options.tracking, (tracker, eventId) => tracker.trackLogin(eventId, { method }, this.identities, this.options))
            })
        },
        async customizeProduct(context) {
            queue.add(async () => {
                await track(this.options.tracking, (tracker, eventId) => tracker.trackCustomizeProduct(eventId, context, this.identities, this.options))
            })
        },
        async session() {
            let pages = (Number(localStorage.getItem('whiteboxPages')) || 0) + 1
            let last = new Date(Number(localStorage.getItem('whiteboxLastVisit')) || Date.now())
            let sessions = (Number(localStorage.getItem('whiteboxSessions')) || 1)
            if (last - Date.now() > 3 * 60 * 1000) {
                sessions++
            }
            if (pages > 1) {
                queue.add(async () => {
                    await track(this.options.tracking, (tracker, eventId) => tracker.trackCustom(eventId, 'Session', { pages, sessions }, this.identities, this.options))
                })
            }
            localStorage.setItem('whiteboxPages', pages)
            localStorage.setItem('whiteboxLastVisit', Date.now())
            localStorage.setItem('whiteboxSessions', sessions)
        },
        async watch(context) {
            if (context.percent > 0) {
                queue.add(async () => {
                    await track(this.options.tracking, (tracker, eventId) => tracker.trackCustom(eventId, 'Watch', context, this.identities, this.options))
                })
            }
        }
    }
})