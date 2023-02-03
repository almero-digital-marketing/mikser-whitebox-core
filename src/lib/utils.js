export function feedType(type) {
    return 'feed.*-' + type.toLowerCase()
}
export function metaField(type, field) {
    return 'feed.*-' + type.toLowerCase() + '.meta.' + field
}