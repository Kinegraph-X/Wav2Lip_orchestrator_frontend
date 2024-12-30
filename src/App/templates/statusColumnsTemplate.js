const {App, TemplateFactory} = require('formantjs')
// const {statuses} = require('../constants/constants')

function get_column_templates(categories, showButton = false) {
    const list_templates = {}

    Object.values(categories).forEach(function(category) {
        list_templates[category] = TemplateFactory.createDef({
            host : TemplateFactory.createHostDef({
                type : 'CompoundComponent',
                nodeName : 'section'
            }),
            members : [
                TemplateFactory.createDef({
                    host : TemplateFactory.createHostDef({
                        type : 'CompoundComponent',
                        nodeName : 'header',
                        attributes : [
                            {className : 'column_header'}
                        ]
                    }),
                    members : [
                        TemplateFactory.createHostDef({
                            type : 'ComponentWithView',
                            nodeName : 'span',
                            attributes : [
                                {textContent : category}
                            ]
                        }),
                        TemplateFactory.createDef({
                            host : TemplateFactory.createHostDef({
                                type : 'ClickableComponent',
                                nodeName : showButton ? 'button' : 'span',
                                attributes : [
                                    {title : showButton ? 'clear logs' : ''},
                                    {className : showButton ? 'backspace' : ''}
                                ]
                            })
                        })
                    ]
                }),
                TemplateFactory.createHostDef({
                    type : 'ComponentWithView',
                    nodeName : 'div',
                    attributes : [
                        {className : showButton ? 'column_content scrollable' : 'column_content'}
                    ]
                })
            ]
        });
    });

    return list_templates
}

module.exports = get_column_templates