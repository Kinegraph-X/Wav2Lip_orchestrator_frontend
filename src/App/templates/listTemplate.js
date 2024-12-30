const {App, TemplateFactory} = require('formantjs')
const {statuses} = require('../constants/constants')

const listHostTemplate = TemplateFactory.createHostDef({
    type : 'ComponentWithView',
	nodeName : 'ul',
    attributes : [
        {className : 'list_host'}
    ]
});

const listItemTemplate = TemplateFactory.createDef({
	host : TemplateFactory.createDef({
		type : 'ComponentWithView',
		nodeName : 'li',
        attributes : [
            {className : 'list_line'}
        ],
		props : [
			{text : undefined}
		],
		reactOnSelf : [
			{
				cbOnly : true,
				from : 'text',
				subscribe : App.componentTypes.ComponentWithView.prototype.appendTextFromValueOnView
			}
		]
	})
});

function get_list_templates(categories) {
    const list_templates = {}

    Object.keys(categories).forEach(function(status) {
        const templates = {}
        list_templates[status] = {
            host : listHostTemplate,
            item : listItemTemplate
        }
    });

    return list_templates
}

module.exports = get_list_templates