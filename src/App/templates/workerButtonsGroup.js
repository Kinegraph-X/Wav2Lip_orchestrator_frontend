const {TemplateFactory} = require('formantjs');
const {statuses, endpoints} = require('../constants/constants')
const endpointNames = Object.keys(endpoints);
const get_button_templates = require('../templates/button_template')
const get_api_requests = require('../api/api')
const apiInterpreter = require ('../api/apiInterpreter')

module.exports = function(workerName, endpointNames) {

    const requests = get_api_requests(workerName)

    function makeStandardRequest(endpointName) {
        const self = this;
        requests[endpointName]()
            .catch(function(error) {
                console.error(error)
            })
            .then(function(response) {
                if (response && response.ok) {
                    const isSuccess = apiInterpreter.interpretResponse(workerName, response)
                    if (isSuccess) {
                        if (endpointName === 'run') {
                            apiInterpreter.startupCheck(workerName)
                        }
                    }
                }
            })
    }

    function makeRestartRequest() {
        const self = this;
        makeStandardRequest.call(this, 'stop')

        setTimeout(function() {
            makeStandardRequest.call(self, 'run')
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
                        const endpoint = endpointNames[e.data.key]
                        if (e.data.key === 3) {
                            makeRestartRequest.call(this);
                        }
                        else {
                            makeStandardRequest.call(this, endpoint);
                        }
                        
                    }
                }
            ]
        }),
        members : Object.values(get_button_templates(workerName))
    })
}