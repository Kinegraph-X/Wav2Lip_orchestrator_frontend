const {App, TemplateFactory} = require('formantjs')
const {status} = require('../constants/constants')

function get_column_templates(categories) {
    const list_templates = {}

    Object.values(categories).forEach(function(status) {
        list_templates[status] = TemplateFactory.createDef({
            host : TemplateFactory.createHostDef({
                type : 'CompoundComponent',
                nodeName : 'section'
            }),
            members : [
                TemplateFactory.createHostDef({
                    type : 'ComponentWithView',
                    nodeName : 'header',
                    attributes : [
                        {className : 'column_header'},
                        {textContent : status}
                    ]
                }),
                TemplateFactory.createHostDef({
                    type : 'ComponentWithView',
                    nodeName : 'div',
                    attributes : [
                        {className : 'column_content'}
                    ]
                })
            ]
        });
    });

    return list_templates
}

module.exports = get_column_templates