import { version } from '../../package.json'

export function feedType(type) {
    return 'feed.*-' + type.toLowerCase()
}
export function metaField(type, field) {
    return 'feed.*-' + type.toLowerCase() + '.meta.' + field
}

export function sha256(val) {
    if (typeof val == 'object') {
        val = JSON.stringify(val)
    }
    if (!crypto.subtle) return val
    return crypto.subtle
    .digest('SHA-256', new TextEncoder('utf-8').encode(val))
    .then(h => {
        let hexes = [],
        view = new DataView(h)
        for (let i = 0; i < view.byteLength; i += 4) {
            hexes.push(('00000000' + view.getUint32(i).toString(16)).slice(-8));
        }
        return hexes.join('')
    })
}

export function localKey(key) {
    return key + '@' + version.split('.')[0]
}

export function removeUndefined(obj, mutate = false, recursive = 0) {
	const returnObj = {}
	Object.entries(obj).forEach(([key, val]) => {
		if(val === undefined) {
			if (mutate) {
				delete obj[key]
			}
		} else {
      let recursiveVal
      if (recursive > 0 && val !== null && typeof val === 'object') {
        recursiveVal = removeUndefined(val, mutate, typeof recursive === 'number' ? (recursive - 1) : true )
      }
      if (!mutate) {
        returnObj[key] = recursiveVal || val
      }
    }
	})
	return mutate ? obj : returnObj
}

export function debounce(fn, wait){
    let timer
    return function(...args){
        if(timer) {
            clearTimeout(timer) // clear any pre-existing timer
        }
        const context = this // get the current context
        timer = setTimeout(()=>{
            fn.apply(context, args) // call the function if time expires
        }, wait)
   }
}