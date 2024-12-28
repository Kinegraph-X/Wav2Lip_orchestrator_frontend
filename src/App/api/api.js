const {api_url, endpoints} = require('../constants/constants')

const get_api_requests = function(worker) {
    const api_request = {}

    Object.keys(endpoints).forEach(function(endpointName) {
        const path = endpoints[endpointName]

        api_request[endpointName] = function () {
    
            return fetch(api_url + path, {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'name' : worker
                })
            }).catch(function(error) {
                console.error('Error requesting the orchestrator, it may not be running')
            });

        }
    })

    // console.log(api_request)
    return api_request
}

module.exports = get_api_requests