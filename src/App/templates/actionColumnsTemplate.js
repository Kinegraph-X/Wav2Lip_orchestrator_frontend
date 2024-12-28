const {App, TemplateFactory} = require('formantjs')

function get_column_template(title) {
    return TemplateFactory.createDef({
        host : TemplateFactory.createHostDef({
            type : 'CompoundComponent',
            nodeName : 'section',
            attributes : [
                {className : 'margin_top'}
            ]
        }),
        members : [
            TemplateFactory.createDef({
                host : TemplateFactory.createDef({
                    type : 'ComponentWithView',
                    nodeName : 'header',
                    attributes : [
                        {className : 'column_header'},
                        {textContent : status}
                    ]
                }),
                members : [
                    TemplateFactory.createDef({
                        nodeName : 'h3',
                        attributes : [
                            {textContent : title}
                        ]
                    })
                ]
            }),
            TemplateFactory.createDef({
                host : TemplateFactory.createHostDef({
                    type : 'CompoundComponent',
                    nodeName : 'div',
                    attributes : [
                        {className : 'row column_content'}
                    ]
                })
            })
        ]
    });
}

module.exports = get_column_template