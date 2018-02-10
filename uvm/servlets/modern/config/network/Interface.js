Ext.define('Ung.config.network.Interface', {
    extend: 'Ext.Dialog',
    alias: 'widget.config-interface',
    width: 900,
    height: 600,

    title: 'Edit Interface'.t(),

    closable: true,
    maximizable: true,

    fullscreen: true,

    layout: 'fit',
    bodyPadding: 0,
    items: [{
        xtype: 'tabpanel',
        defaultType: 'panel',
        tabBar: {
            layout: {
                pack: 'left'
            }
        },
        defaults: {
            bodyPadding: 20,
        },
        items: [{
            title: 'IPv4 Configuration'.t(),
            items: [{
                xtype: 'pickerfield',
                label: 'pick'
            }]
        }, {
            title: 'IPv6 Configuration'.t(),
            html: 'tab 2'
        }, {
            title: 'DHCP Configuration'.t(),
            html: 'tab 3'
        }, {
            title: 'Redundancy (VRRP)'.t(),
            html: 'tab 4'
        }]
    }],


    defaultFocus: '#ok',
    buttons: [{
        text: 'Cancel',
        iconCls: 'fa fa-ban fa-red',
        handler: function (btn) {
            btn.up('window').close();
        }
        // handler: 'cancelEdit'
    }, {
        text: 'Done',
        iconCls: 'fa fa-check',
        // handler: 'doneEdit'
    }]

});

