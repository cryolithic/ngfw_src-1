Ext.define('Ung.config.network.Main', {
    extend: 'Ext.Panel',
    alias: 'widget.config-network',

    controller: 'config-network',

    layout: 'card',
    viewModel: {
        type: 'config-network'
    },

    masked: true,

    // tabPosition: 'left',
    // tabRotation: 0,
    // tabStretchMax: false,

    items: [
        {
            xtype: 'toolbar',
            docked: 'bottom',
            items: [{
                text: 'Save Network Settings'.t(),
                ui: 'action',
                iconCls: 'x-fa fa-floppy-o',
                handler: 'saveSettings'
            }]
        },
        { xtype: 'config-network-interfaces' },
        { xtype: 'config-network-hostname' },
        // { xtype: 'config-network-services' },
        // { xtype: 'config-network-port-forward-rules' },
        { xtype: 'config-network-nat-rules' },
        { xtype: 'config-network-bypass-rules' },
        { xtype: 'config-network-filter-rules' },
        // { xtype: 'config-network-routes' },
        // { xtype: 'config-network-dns-server' },
        // { xtype: 'config-network-dhcp-server' },
        // { xtype: 'config-network-advanced' },
        // { xtype: 'config-network-troubleshooting' }
    ]
});
