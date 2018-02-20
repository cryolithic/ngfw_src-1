Ext.define('Ung.view.reports.Reports', {
    extend: 'Ext.Panel',
    alias: 'widget.ung-reports',
    itemId: 'reports',


    controller: 'reports',
    // viewModel: true,

    defaultType: 'panel',
    layout: 'fit',

    listeners: {
        painted: 'onInitialize',
        // activate: 'onActivate'
    },

    items: [{
        docked: 'left',
        width: 350,
        layout: 'fit',

        tbar: {
            items: [{
                xtype: 'searchfield',
                ui: 'faded',
                flex: 1,
                placeholder: 'Find reports...'.t(),
            }]
        },
        resizable: {
            split: true,
            edges: 'east'
        },
        items: [{
            xtype: 'treelist',
            scrollable: true,
            ui: 'nav',
            singleExpand: true,
            expanderFirst: false,
            expanderOnly: false,
            selectOnExpander: true,
            highlightPath: false,
            store: 'reportstree',
            listeners: {
                selectionchange: 'onSelectionChange'
            }
        }]
    }, {
        xtype: 'panel',
        layout: 'hbox',
        bind: {
            title: '{entry.title}'
        },
        tbar: {
            style: {
                // background: '#F5F5F5',
                fontSize: '14px',
                fontWeight: 400,
                zIndex: 10
            },
            bind: {
                html: '{entry.description}'
            }
        },
        // {
        //     xtype: 'toolbar',
        //     docked: 'top',
        //     shadow: false,
        //     padding: 16,
        //     style: {
        //         // background: '#F5F5F5',
        //         fontSize: '14px',
        //         fontWeight: 400,
        //         zIndex: 10
        //     },
        //     bind: {
        //         html: '{entry.type === "EVENT_LIST" ? entry.description : ""}'
        //     }
        // }
        items: [{
            xtype: 'graphreport',
            reference: 'graphreport',
            flex: 1,
            padding: 5,
            border: true
        }, {
            xtype: 'eventreport',
            reference: 'eventreport',
            flex: 1,
            border: true
        }, {
            title: 'Text Report',
            reference: 'textreport',
            flex: 1,
            padding: 5,
            border: true
        }]
    }]


});
