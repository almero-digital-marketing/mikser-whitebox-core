let queryContext = 'mikser'
let dataContext
if (WHITEBOX_CONTEXT != queryContext) {
    queryContext += '_' + WHITEBOX_CONTEXT
    dataContext = WHITEBOX_CONTEXT
}

export { queryContext, dataContext }