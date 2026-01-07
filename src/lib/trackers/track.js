import axios from 'axios'

export async function trackSst(name, eventId, eventName, context = {}, identities) {
    const { connect } = window.whitebox.services
    let data = {
        tracker: name,
        event: eventName,
        eventId,
        context,
        url: window.location.href,
        timestamp: Date.now(),
        page: window.location.href
    }   
    data.identities = [ 
        ...identities
    ]
    const userId = identities.find(identity => identity.name == 'userId')?.value
    if (userId) {
        data.identities.push({ 
            id: "fingerprint",
            name: "userId", 
            value: userId
        })
    }
    if (connect.runtime.sst) {
        await axios.post(`${connect.runtime.url}/track`, data, {
            headers: {
                'Authorization': 'Bearer ' + connect.runtime.tokens.connect,
                'Fingerprint': connect.runtime.fingerprint,
            }
        }).catch(err => console.error('Server side track error:', eventId, name, err))
        console.log(`Server side track ${eventName}:`, eventId, name, context)
    }  
}

export async function trackNone(name, eventId, eventName) {
    console.log(`Track ${eventName} none:`, eventId, name)
}