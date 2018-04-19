Ext.define('Ung.Setup.InternalNetwork', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.InternalNetwork',

    title: 'Internal Network'.t(),
    description: 'Configure the Internal Network Interface'.t(),

    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items: [{
        xtype: 'component',
        html: '<h3>' + 'Configure the Internal Network Interface'.t() + '</h3>'
    }, {
        xtype: 'container',
        layout: {
            type: 'column',
        },
        items: [{
            xtype: 'container',
            columnWidth: 0.7,
            defaults: {
                padding: '0 0 0 10'
            },
            items: [{
                xtype: 'radio',
                reference: 'routerRadio',
                name: 'configType',
                inputValue: 'ROUTER',
                boxLabel: '<strong>' + 'Router'.t() + '</strong>',
                padding: 0,
                bind: {
                    value: '{nonWan.configType !== "BRIDGED"}'
                },
                listeners: {
                    change: 'setConfigType'
                }
            }, {
                xtype: 'component',
                margin: '0 0 10 0',
                html: 'This is recommended if the external port is plugged into the internet connection. This enables NAT and DHCP.'.t()
            }, {
                xtype: 'textfield',
                labelWidth: 150,
                width: 350,
                labelAlign: 'right',
                fieldLabel: 'Internal Address'.t(),
                vText: 'Please enter a valid Network  Address'.t(),
                vtype: 'ipAddress',
                allowBlank: false,
                msgTarget: 'side',
                maskRe: /(\d+|\.)/,
                disabled: true,
                value: '192.168.1.1',
                validationEvent: 'blur',
                bind: { value: '{nonWan.v4StaticAddress}', disabled: '{!routerRadio.checked}' }
            }, {
                labelWidth: 150,
                width: 350,
                labelAlign: 'right',
                fieldLabel: 'Internal Netmask'.t(),
                xtype: 'combo',
                // store: Util.v4NetmaskList,
                queryMode: 'local',
                triggerAction: 'all',
                disabled: true,
                editable: false,
                bind: { value: '{nonWan.v4StaticPrefix}', disabled: '{!routerRadio.checked}' }
            }, {
                xtype: 'checkbox',
                margin: '0 0 0 155',
                disabled: true,
                boxLabel: 'Enable DHCP Server (default)'.t(),
                bind: { value: '{nonWan.dhcpEnabled}', disabled: '{!routerRadio.checked}' }
            }]
        }, {
            xtype: 'component',
            columnWidth: 0.3,
            margin: 20,
            html: '<img src="/skins/' + rpc.skinName + '/images/admin/wizard/router.png"/>'
        }]
    }, {
        xtype: 'container',
        margin: '10 0 0 0',
        layout: {
            type: 'column',
        },
        items: [{
            xtype: 'container',
            columnWidth: 0.7,
            defaults: {
                padding: '0 0 0 10'
            },
            items: [{
                xtype: 'radio',
                reference: 'bridgeRadio',
                name: 'configType',
                inputValue: 'BRIDGED',
                boxLabel: '<strong>' + 'Transparent Bridge'.t() + '</strong>',
                padding: 0,
                bind: {
                    value: '{nonWan.configType === "BRIDGED"}'
                },
                listeners: {
                    change: 'setConfigType'
                }
            }, {
                xtype: 'component',
                margin: '0 0 10 0',
                html: 'This is recommended if the external port is plugged into a firewall/router. This bridges Internal and External and disables DHCP.'.t()
            }]
        }, {
            xtype: 'component',
            columnWidth: 0.3,
            margin: 20,
            html: '<img src="/skins/' + rpc.skinName + '/images/admin/wizard/bridge.png"/>'
        }]
    }],

    listeners: {
        save: 'onSave'
    },

    controller: {
        onSave: function (cb) {
            cb();
        }
    }
});
