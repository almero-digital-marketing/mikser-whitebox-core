export function feedType(type) {
    return 'feed.mikser-' + type.toLowerCase()
}
export function metaField(type, field) {
    return 'feed.mikser-' + type.toLowerCase() + '.meta.' + field
}