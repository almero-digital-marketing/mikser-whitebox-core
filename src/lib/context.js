let queryContext = 'mikser'
let dataContext
if (typeof process != 'undefined' && process.env['VUE_APP_WHITEBOX_CONTEXT']) {
    queryContext += '_' + process.env['VUE_APP_WHITEBOX_CONTEXT']
    dataContext = process.env['VUE_APP_WHITEBOX_CONTEXT']
}

export { queryContext, dataContext }