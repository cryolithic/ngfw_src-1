Ext.define('Ung.view.Widget', {
    extend: 'Ext.Panel',
    alias: 'widget.wg',

    width: 500,
    height: 300,
    margin: 10,

    baseCls: 'widget',

    bodyStyle: {
        background: '#999'
    },
    border: true,
    tools: [
        {
            xtype: 'menu',
            iconCls: 'x-fa fa-wrench',
            items: [{
                text: 'AAA'
            }]
        }
    ]
});
