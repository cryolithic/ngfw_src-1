Ext.define('Ung.Setup.Main', {
    extend: 'Ext.container.Viewport',
    // controller: 'main',

    // viewModel: true,
    layout: 'center',
    items: [{
        xtype: 'container',
        layout: {
            type: 'vbox',
            align: 'center'
        },
        items: [{
            xtype: 'component',
            margin: '0 0 20 0',
            style: { textAlign: 'center' },
            html: '<h1>' + Ext.String.format('Thanks for choosing {0}!'.t(), rpc.oemName) + '</h1>' +
                '<p>' + Ext.String.format('A wizard will guide you through the initial setup and configuration of the {0} Server.'.t(), rpc.oemName) + '</p>'
        }, {
            xtype: 'button',
            scale: 'medium',
            iconCls: 'fa fa-play fa-lg',
            text: 'Run Setup Wizard'.t()
        }]
    }]

});
