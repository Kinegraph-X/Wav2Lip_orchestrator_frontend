const {workers, endpoints} = require('../constants/constants');
const workerNames = Object.keys(workers);
const get_api_requests = require('../api/api');
const apiInterpreter = require ('../api/apiInterpreter')

const requests = {};
workerNames.forEach(function(workerName) {
    requests[workerName] = get_api_requests(workerName)
})

function makeStandardRequest(workerName, endpoint) {
    const self = this;
    requests[workerName][endpoint]()
        .catch(function(error) {
            console.error(error)
        })
        .then(function(response) {
            if (response && response.ok) {
                const isSuccess = apiInterpreter.interpretResponse(workerName, response) 
                if (isSuccess) {
                    if (endpoint === 'run') {
                        apiInterpreter.startupCheck(workerName)
                    }
                }
            }
        })
}

function makeRestartRequest(workerName) {
    const self = this;
    makeStandardRequest.call(this, workerName, 'stop')

    setTimeout(function() {
        makeStandardRequest.call(self, workerName, 'run')
    }, 3000)
}

module.exports = {
    makeStandardRequest : makeStandardRequest,
    makeRestartRequest : makeRestartRequest
}