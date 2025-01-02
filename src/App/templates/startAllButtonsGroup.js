const {TemplateFactory} = require('formantjs');
const {statuses} = require('../constants/constants')
const get_button_template = require('../templates/startAllbutton_template')
const get_api_requests = require('../api/api')
const apiInterpreter = require ('../api/apiInterpreter')

module.exports = function(workerNames, endpointNames) {

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
                    const isSuccess = apiInterpreter.interpretResponse(workerName, response)  // passing a ref to self is a small hack 
                                                                                            // to be able to refresh statuses when calling /status_worker
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

    return TemplateFactory.createDef({
        host : TemplateFactory.createHostDef({
            type : 'CompoundComponent',
            nodeName : 'div',
            props : [
                {statusFeedback : undefined}
            ],
            reactOnSelf : [
                {
                    cbOnly : true,
                    from : 'statusFeedback',
                    subscribe : function(value) {
                        if (value === statuses.running) {
                            this._children[0].view.setPresence(false)
                            this._children[1].view.setPresence(true)
                        }
                        else if (value === statuses.stopped) {
                            this._children[0].view.setPresence(true)
                            this._children[1].view.setPresence(false)
                        }
                        else if (value === statuses.error) {
                            this._children[0].view.setPresence(false)
                            this._children[1].view.setPresence(false)
                        }
                    }
                }
            ],
            subscribeOnChild : [
                {
                    on : 'clicked_ok',
                    subscribe : function(e) {
                        const self = this;
                        const endpoint = endpointNames[e.data.key]
                        if (e.data.key === 3) {
                            for (let i = 0, max = 2; i < max; i++) {
                                let workerName = workerNames[i]
                                setTimeout(function() {
                                    makeRestartRequest.call(self, workerName);
                                }, i * 2000)
                            }
                        }
                        else {
                            for (let i = 0, max = 2; i < max; i++) {
                                let workerName = workerNames[i]
                                setTimeout(function() {
                                    makeStandardRequest.call(self, workerName, endpoint);
                                }, i * 2000)
                            }
                        }
                        
                    }
                }
            ]
        }),
        members : Object.values(get_button_template())
    })
}