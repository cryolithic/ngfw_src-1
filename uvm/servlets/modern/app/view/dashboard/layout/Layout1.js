Ext.define('Ung.view.dashboard.Layout1', {
    extend: 'Ext.Panel',
    alias: 'widget.layout1',

    // width: 800,

    // baseCls: 'layout1',
    scrollable: true,
    items: [{
        // row 1
        xtype: 'container',
        layout: 'hbox',
        defaults: {
            cls: 'placeholder',
            margin: 10,
            height: 300
        },
        items: [{
            xtype: 'component',
            html: 'Widget 1',
            flex: 1
        }, {
            xtype: 'component',
            html: 'Widget 2',
            width: 300
        }, {
            xtype: 'component',
            html: 'Widget 3',
            width: 300
        }, {
            xtype: 'component',
            html: 'Widget 4',
            flex: 1
        }]
    }, {
        // row 2
        xtype: 'container',
        layout: 'hbox',
        defaults: {
            cls: 'placeholder',
            margin: 10,
            height: 400
        },
        items: [{
            xtype: 'component',
            flex: 1
        }, {
            xtype: 'container',
            width: 620,
            layout: 'vbox',
            items: [{
                xtype: 'component',
                flex: 1
            }, {
                xtype: 'component',
                height: 20,
                style: {
                    background: '#FAFAFA'
                }
            }, {
                xtype: 'component',
                flex: 1
            }]
        }, {
            xtype: 'container',
            flex: 1,
            layout: 'vbox',
            items: [{
                xtype: 'component',
                flex: 1
            }, {
                xtype: 'component',
                height: 20,
                style: {
                    background: '#FAFAFA'
                }
            }, {
                xtype: 'component',
                flex: 1
            }]
        }]
    }]


    // items: [{
    //     xtype: 'component',
    //     width: 600,
    //     height: 300
    // }, {
    //     xtype: 'container',
    //     width: 400,
    //     height: 300,
    //     layout: {
    //         type: 'vbox',
    //         align: 'stretch'
    //     },
    //     items: [{
    //         xtype: 'component',
    //         html: '1'
    //     }, {
    //         xtype: 'component',
    //         html: '2'
    //     }]
    // }, {
    //     xtype: 'component',
    //     width: 400,
    //     height: 300
    // }, {
    //     xtype: 'component',
    //     width: 300,
    //     height: 300
    // }, {
    //     xtype: 'component',
    //     width: 300,
    //     height: 300
    // }],

});
