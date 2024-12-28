const {TemplateFactory} = require('formantjs');
const {status} = require('../constants/constants')
const get_button_templates = require('../templates/button_template')
const apiInterpreter = require ('../api/apiInterpreter')
const healthCheck = require('../api/healthCheck')

module.exports = function(workerName, endpointNames, requests) {
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
                        if (value === status['running']) {
                            this._children[0].view.setPresence(false)
                            this._children[1].view.setPresence(true)
                        }
                        else if (value === status['stopped']) {
                            this._children[0].view.setPresence(true)
                            this._children[1].view.setPresence(false)
                        }
                        else if (value === status['error']) {
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
                        requests[endpoint]()
                            .catch(function(error) {
                                console.log(error)
                            })
                            .then(function(response) {
                                if (response && response.ok) {
                                    const isSuccess = apiInterpreter.interpretResponse(workerName, response)
                                    if (isSuccess) {
                                        if (endpoint === 'run') {
                                            self.streams.statusFeedback.value = status['running'];
                                            healthCheck.startupCheck(workerName)
                                        }
                                        else if (endpoint === 'stop')
                                            self.streams.statusFeedback.value = status['stopped'];
                                    }
                                }
                            })
                    }
                }
            ]
        }),
        members : Object.values(get_button_templates(workerName))
    })
}