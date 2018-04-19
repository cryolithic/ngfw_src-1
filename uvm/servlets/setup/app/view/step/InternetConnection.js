Ext.define('Ung.Setup.InternetConnection', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.Internet',

    title: 'Internet Connection'.t(),
    description: 'Configure the Internet Connection'.t(),

    layout: {
        type: 'hbox',
        align: 'begin',
        pack: 'center'
    },

    items: [{
        xtype: 'container',
        margin: '50 20 0 0',
        width: 300,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [{
            xtype: 'component',
            cls: 'sectionheader',
            // margin: '30 0 0 0',
            html: 'Configuration Type'.t()
        }, {
            xtype: 'radiogroup',
            // fieldLabel: 'Configuration Type'.t(),
            // labelWidth: 160,
            labelAlign: 'right',
            simpleValue: true,
            layout: { type: 'hbox' },
            defaults: { padding: '1 15 1 0' },
            items: [
                { boxLabel: '<strong>' + 'Auto (DHCP)'.t() + '</strong>', inputValue: 'AUTO' },
                { boxLabel: '<strong>' + 'Static'.t() + '</strong>', inputValue: 'STATIC' },
                { boxLabel: '<strong>' + 'PPPoE'.t() + '</strong>', inputValue: 'PPPOE' }
            ],
            bind: {
                value: '{wan.v4ConfigType}'
            }
        }, {
            xtype: 'container',
            width: 200,
            layout: {
                type: 'vbox',
                // align: 'stretch'
            },
            hidden: true,
            bind: {
                hidden: '{wan.v4ConfigType !== "STATIC"}'
            },
            defaults: {
                xtype: 'textfield',
                labelAlign: 'top',
                msgTarget: 'side',
                validationEvent: 'blur',
                maskRe: /(\d+|\.)/,
                vtype: 'ipAddress'
            },
            items: [{
                fieldLabel: 'IP Address'.t(),
                allowBlank: false,
                bind: { value: '{wan.v4StaticAddress}', emptyText: '{wan.v4Address}' }
            }, {
                fieldLabel: 'Netmask'.t(),
                xtype: 'combo',
                store: [
                    [32, '/32 - 255.255.255.255'],
                    [31, '/31 - 255.255.255.254'],
                    [30, '/30 - 255.255.255.252'],
                    [29, '/29 - 255.255.255.248'],
                    [28, '/28 - 255.255.255.240'],
                    [27, '/27 - 255.255.255.224'],
                    [26, '/26 - 255.255.255.192'],
                    [25, '/25 - 255.255.255.128'],
                    [24, '/24 - 255.255.255.0'],
                    [23, '/23 - 255.255.254.0'],
                    [22, '/22 - 255.255.252.0'],
                    [21, '/21 - 255.255.248.0'],
                    [20, '/20 - 255.255.240.0'],
                    [19, '/19 - 255.255.224.0'],
                    [18, '/18 - 255.255.192.0'],
                    [17, '/17 - 255.255.128.0'],
                    [16, '/16 - 255.255.0.0'],
                    [15, '/15 - 255.254.0.0'],
                    [14, '/14 - 255.252.0.0'],
                    [13, '/13 - 255.248.0.0'],
                    [12, '/12 - 255.240.0.0'],
                    [11, '/11 - 255.224.0.0'],
                    [10, '/10 - 255.192.0.0'],
                    [9, '/9 - 255.128.0.0'],
                    [8, '/8 - 255.0.0.0'],
                    [7, '/7 - 254.0.0.0'],
                    [6, '/6 - 252.0.0.0'],
                    [5, '/5 - 248.0.0.0'],
                    [4, '/4 - 240.0.0.0'],
                    [3, '/3 - 224.0.0.0'],
                    [2, '/2 - 192.0.0.0'],
                    [1, '/1 - 128.0.0.0'],
                    [0, '/0 - 0.0.0.0']
                ],
                queryMode: 'local',
                triggerAction: 'all',
                value: 24,
                bind: { value: '{wan.v4StaticPrefix}', emptyText: '/{wan.v4PrefixLength} - {wan.v4Netmask}' },
                editable: false,
                allowBlank: false
            }, {
                fieldLabel: 'Gateway'.t(),
                allowBlank: false,
                bind: { value: '{wan.v4StaticGateway}', emptyText: '{wan.v4Gateway}' }
            }, {
                fieldLabel: 'Primary DNS'.t(),
                allowBlank: false,
                bind: { value: '{wan.v4StaticDns1}', emptyText: '{wan.v4Dns1}' }
            }, {
                xtype: 'textfield',
                vtype: 'ipAddress',
                name: 'dns2',
                fieldLabel: 'Secondary DNS'.t(),
                allowBlank: true,
                bind: { value: '{wan.v4StaticDns2}', emptyText: '{wan.v4Dns2}' }
            }]
        }, {
            xtype: 'container',
            hidden: true,
            bind: {
                hidden: '{wan.v4ConfigType !== "PPPOE"}'
            },
            defaults: {
                xtype: 'textfield',
                labelWidth: 150,
                width: 350,
                labelAlign: 'right'
            },
            items: [{
                fieldLabel: 'Username'.t(),
                bind: { value: '{wan.v4PPPoEUsername}' }
            }, {
                inputType: 'password',
                fieldLabel: 'Password'.t(),
                bind: { value: '{wan.v4PPPoEPassword}' }
            }]
        }]
    }, {
        xtype: 'container',
        margin: '50 20 0 0',
        width: 200,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        defaults: {
            xtype: 'displayfield',
            // labelWidth: 170,
            labelAlign: 'right',
            margin: 0
        },
        items: [{
            xtype: 'component',
            cls: 'sectionheader',
            html: 'Status'.t()
        }, {
            fieldLabel: 'IP Address'.t(),
            bind: { value: '{wan.v4Address || "<not set>"}' }
        }, {
            fieldLabel: 'Netmask'.t(),
            bind: { value: '{wan.v4Netmask}' }
        }, {
            fieldLabel: 'Gateway'.t(),
            bind: { value: '{wan.v4Gateway}' }
        }, {
            fieldLabel: 'Primary DNS'.t(),
            bind: { value: '{wan.v4Dns1}' }
        }, {
            fieldLabel: 'Secondary DNS'.t(),
            bind: { value: '{wan.v4Dns2}' }
        }]
    }],


    // items: [{
    //     xtype: 'component',
    //     cls: 'sectionheader',
    //     // margin: '30 0 0 0',
    //     html: 'Configuration Type'.t()
    // }, {
    //     xtype: 'radiogroup',
    //     // fieldLabel: 'Configuration Type'.t(),
    //     // labelWidth: 160,
    //     labelAlign: 'right',
    //     simpleValue: true,
    //     layout: { type: 'hbox' },
    //     defaults: { padding: '1 15 1 0' },
    //     items: [
    //         { boxLabel: '<strong>' + 'Auto (DHCP)'.t() + '</strong>', inputValue: 'AUTO' },
    //         { boxLabel: '<strong>' + 'Static'.t() + '</strong>', inputValue: 'STATIC' },
    //         { boxLabel: '<strong>' + 'PPPoE'.t() + '</strong>', inputValue: 'PPPOE' }
    //     ],
    //     bind: {
    //         value: '{wan.v4ConfigType}'
    //     }
    // }, {
    //     xtype: 'panel',
    //     layout: 'card',
    //     border: false,
    //     flex: 1,
    //     margin: '10 0 0 0',
    //     defaults: {
    //         xtype: 'form',
    //         border: false,
    //         bodyBorder: false,
    //         // margin: '10 0 0 0'
    //     },
    //     bind: {
    //         activeItem: '{wan.v4ConfigType}'
    //     },
    //     items: [{
    //         itemId: 'AUTO',
    //         items: [{
    //             xtype: 'fieldset',
    //             title: 'DHCP Status'.t(),
    //             padding: 10,
    //             defaults: {
    //                 xtype: 'displayfield',
    //                 labelWidth: 170,
    //                 labelAlign: 'right',
    //                 margin: 0
    //             },
    //             items: [{
    //                 fieldLabel: 'Current IP Address'.t(),
    //                 bind: { value: '{wan.v4Address}' }
    //             }, {
    //                 fieldLabel: 'Current Netmask'.t(),
    //                 bind: { value: '{wan.v4Netmask}' }
    //             }, {
    //                 fieldLabel: 'Current Gateway'.t(),
    //                 bind: { value: '{wan.v4Gateway}' }
    //             }, {
    //                 fieldLabel: 'Current Primary DNS'.t(),
    //                 bind: { value: '{wan.v4Dns1}' }
    //             }, {
    //                 fieldLabel: 'Current Secondary DNS'.t(),
    //                 bind: { value: '{wan.v4Dns2}' }
    //             }]
    //         }]
    //     }, {
    //         itemId: 'STATIC',
    //         items: [{
    //             xtype: 'fieldset',
    //             title: 'Static'.t(),
    //             padding: 10,
    //             defaults: {
    //                 xtype: 'textfield',
    //                 labelWidth: 150,
    //                 width: 350,
    //                 labelAlign: 'right',
    //                 msgTarget: 'side',
    //                 validationEvent: 'blur',
    //                 maskRe: /(\d+|\.)/,
    //                 vtype: 'ipAddress'
    //             },
    //             items: [{
    //                 fieldLabel: 'IP Address'.t(),
    //                 allowBlank: false,
    //                 bind: { value: '{wan.v4StaticAddress}', emptyText: '{wan.v4Address}' }
    //             }, {
    //                 fieldLabel: 'Netmask'.t(),
    //                 xtype: 'combo',
    //                 store: [
    //                     [32, '/32 - 255.255.255.255'],
    //                     [31, '/31 - 255.255.255.254'],
    //                     [30, '/30 - 255.255.255.252'],
    //                     [29, '/29 - 255.255.255.248'],
    //                     [28, '/28 - 255.255.255.240'],
    //                     [27, '/27 - 255.255.255.224'],
    //                     [26, '/26 - 255.255.255.192'],
    //                     [25, '/25 - 255.255.255.128'],
    //                     [24, '/24 - 255.255.255.0'],
    //                     [23, '/23 - 255.255.254.0'],
    //                     [22, '/22 - 255.255.252.0'],
    //                     [21, '/21 - 255.255.248.0'],
    //                     [20, '/20 - 255.255.240.0'],
    //                     [19, '/19 - 255.255.224.0'],
    //                     [18, '/18 - 255.255.192.0'],
    //                     [17, '/17 - 255.255.128.0'],
    //                     [16, '/16 - 255.255.0.0'],
    //                     [15, '/15 - 255.254.0.0'],
    //                     [14, '/14 - 255.252.0.0'],
    //                     [13, '/13 - 255.248.0.0'],
    //                     [12, '/12 - 255.240.0.0'],
    //                     [11, '/11 - 255.224.0.0'],
    //                     [10, '/10 - 255.192.0.0'],
    //                     [9, '/9 - 255.128.0.0'],
    //                     [8, '/8 - 255.0.0.0'],
    //                     [7, '/7 - 254.0.0.0'],
    //                     [6, '/6 - 252.0.0.0'],
    //                     [5, '/5 - 248.0.0.0'],
    //                     [4, '/4 - 240.0.0.0'],
    //                     [3, '/3 - 224.0.0.0'],
    //                     [2, '/2 - 192.0.0.0'],
    //                     [1, '/1 - 128.0.0.0'],
    //                     [0, '/0 - 0.0.0.0']
    //                 ],
    //                 queryMode: 'local',
    //                 triggerAction: 'all',
    //                 value: 24,
    //                 bind: { value: '{wan.v4StaticPrefix}', emptyText: '/{wan.v4PrefixLength} - {wan.v4Netmask}' },
    //                 editable: false,
    //                 allowBlank: false
    //             }, {
    //                 fieldLabel: 'Gateway'.t(),
    //                 allowBlank: false,
    //                 bind: { value: '{wan.v4StaticGateway}', emptyText: '{wan.v4Gateway}' }
    //             }, {
    //                 fieldLabel: 'Primary DNS'.t(),
    //                 allowBlank: false,
    //                 bind: { value: '{wan.v4StaticDns1}', emptyText: '{wan.v4Dns1}' }
    //             }, {
    //                 xtype: 'fieldcontainer',
    //                 width: 'auto',
    //                 layout: { type: 'hbox', align: 'middle' },
    //                 items: [{
    //                     xtype: 'textfield',
    //                     labelWidth: 150,
    //                     width: 350,
    //                     labelAlign: 'right',
    //                     msgTarget: 'side',
    //                     validationEvent: 'blur',
    //                     maskRe: /(\d+|\.)/,
    //                     vtype: 'ipAddress',
    //                     name: 'dns2',
    //                     fieldLabel: 'Secondary DNS'.t(),
    //                     allowBlank: true,
    //                     bind: { value: '{wan.v4StaticDns2}', emptyText: '{wan.v4Dns2}' }
    //                 }, {
    //                     xtype: 'label',
    //                     margin: '0 0 0 5',
    //                     style: { color: '#999', fontSize: '11px' },
    //                     html: '(optional)'.t()
    //                 }]
    //             }]
    //         }]
    //     }, {
    //         itemId: 'PPPOE',
    //         items: [{
    //             xtype: 'fieldset',
    //             title: 'PPPoE Settings'.t(),
    //             padding: 10,
    //             defaults: {
    //                 xtype: 'textfield',
    //                 labelWidth: 150,
    //                 width: 350,
    //                 labelAlign: 'right'
    //             },
    //             items: [{
    //                 fieldLabel: 'Username'.t(),
    //                 bind: { value: '{wan.v4PPPoEUsername}' }
    //             }, {
    //                 inputType: 'password',
    //                 fieldLabel: 'Password'.t(),
    //                 bind: { value: '{wan.v4PPPoEPassword}' }
    //             }]
    //         }, {
    //             xtype: 'fieldset',
    //             title: 'PPPoE Status'.t(),
    //             padding: 10,
    //             defaults: {
    //                 xtype: 'displayfield',
    //                 labelWidth: 150,
    //                 labelAlign: 'right',
    //                 margin: 0
    //             },
    //             items: [
    //                 { fieldLabel: 'IP Address'.t(),    bind: { value: '{wan.v4Address}' } },
    //                 { fieldLabel: 'Netmask'.t(),       bind: { value: '{wan.v4Netmask}' } },
    //                 { fieldLabel: 'Gateway'.t(),       bind: { value: '{wan.v4Gateway}' } },
    //                 { fieldLabel: 'Primary DNS'.t(),   bind: { value: '{wan.v4Dns1}' } },
    //                 { fieldLabel: 'Secondary DNS'.t(), bind: { value: '{wan.v4Dns2}' } }
    //             ]
    //         }]
    //     }]
    // }, {
    //     xtype: 'container',
    //     layout: {
    //         type: 'hbox',
    //         align: 'middle',
    //         pack: 'center'
    //     },
    //     defaults: {
    //         xtype: 'button',
    //         margin: '0 5'
    //     },
    //     items: [{
    //         text: 'Renew DHCP'.t(),
    //         iconCls: 'fa fa-refresh',
    //         handler: 'renewDhcp', // renew DHCP and refresh status
    //         bind: {
    //             hidden: '{wan.v4ConfigType !== "AUTO"}'
    //         }
    //     }, {
    //         text: 'Test Connectivity'.t(),
    //         iconCls: 'fa fa-compress',
    //         handler: 'save', // save is called because connectivity test is done inside of it
    //         bind: {
    //             hidden: '{wan.v4ConfigType !== "AUTO" && wan.v4ConfigType !== "STATIC" }'
    //         }
    //     }]
    // }],

    listeners: {
        save: 'onSave'
    },

    controller: {
        onSave: function (cb) {
            cb();
        }
    }





});
