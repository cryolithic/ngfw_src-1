Ext.define('Ung.view.reports.Reports', {
    extend: 'Ext.Panel',
    alias: 'widget.ung-reports',
    itemId: 'reports',


    controller: 'reports',
    // viewModel: true,

    defaultType: 'panel',
    layout: 'hbox',

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
        title: 'Graph Report',
        reference: 'graphreport',
        flex: 1,
        padding: 5,
        border: true
    }, {
        title: 'Event Report',
        reference: 'eventreport',
        flex: 1,
        padding: 5,
        border: true
    }, {
        title: 'Text Report',
        reference: 'textreport',
        flex: 1,
        padding: 5,
        border: true
    }]


});
