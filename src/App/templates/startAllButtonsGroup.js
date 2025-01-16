const {TemplateFactory} = require('formantjs');
const {statuses} = require('../constants/constants')
const get_button_template = require('../templates/startAllbutton_template')

const {makeStandardRequest, makeRestartRequest} = require('../api/allButtonsRequests')

module.exports = function(workerNames, endpointNames) {

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
                            for (let i = 0, max = workerNames.length; i < max; i++) {
                                let workerName = workerNames[i]
                                setTimeout(function() {
                                    makeRestartRequest.call(self, workerName);
                                }, i * 2000)
                            }
                        }
                        else {
                            for (let i = 0, max = workerNames.length; i < max; i++) {
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