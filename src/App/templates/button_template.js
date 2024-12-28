const {TemplateFactory} = require('formantjs')
const {endpoints} = require('../constants/constants')

function get_button_templates(worker) {
    const button_templates = {}

    Object.keys(endpoints).forEach(function(endpointName) {

        button_templates[endpointName] = TemplateFactory.createDef({
            host : TemplateFactory.createHostDef({
                type : 'ClickableComponent',
                nodeName : 'button',
                attributes : [
                    {className : endpointName + '_button'},
                    {textContent : endpointName}
                ]
            })
        });
    });

    return button_templates
}

module.exports = get_button_templates