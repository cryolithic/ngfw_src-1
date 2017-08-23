Ext.define('Ung.apps.ipsecvpn.view.VpnConfig', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.app-ipsec-vpn-vpnconfig',
    itemId: 'vpn-config',
    title: 'VPN Config'.t(),

    viewModel: {
        formulas: {
           _btnConfigureDirectory: function (get) {
                switch (get('settings.authenticationType')) {
                case 'LOCAL_DIRECTORY': return 'Configure Local Directory'.t();
                case 'RADIUS_SERVER': return 'Configure RADIUS'.t();
                default: return '';
                }
            }
        }
    },

    bodyPadding: 10,
    withValidation: true,

    tbar: [{
        xtype: 'tbtext',
        padding: '8 5',
        style: { fontSize: '12px', fontWeight: 600 },
        html: 'The VPN Config tab contains settings used to configure the server to support IPsec L2TP, Xauth, and IKEv2 VPN client connections.'.t()
    }],

    defaults: {
        labelWidth: 240
    },

    items: [{
        xtype: 'checkbox',
        bind: '{settings.vpnflag}',
        fieldLabel: 'Enable L2TP/Xauth/IKEv2 Server'.t()
    },{
        xtype: 'textfield',
        bind: '{settings.virtualAddressPool}',
        vtype: 'cidrBlock',
        allowBlank: false,
        fieldLabel: 'L2TP Address Pool'.t()
    },{
        xtype: 'textfield',
        bind: '{settings.virtualXauthPool}',
        vtype: 'cidrBlock',
        allowBlank: false,
        fieldLabel: 'Xauth/IKEv2 Address Pool'.t()
    },{
        xtype: 'textfield',
        bind: '{settings.virtualDnsOne}',
        vtype: 'ipAddress',
        allowBlank: true,
        fieldLabel: 'Custom DNS Server 1'.t()
    },{
        xtype: 'textfield',
        bind: '{settings.virtualDnsTwo}',
        vtype: 'ipAddress',
        allowBlank: true,
        fieldLabel: 'Custom DNS Server 2'.t()
    },{
        xtype: 'displayfield',
        value:  '<STRONG>' + 'NOTE: Leave the Custom DNS fields empty to have clients automatically configured to use this server for DNS resolution.'.t() + '</STRONG>'
    },{
        xtype: 'textfield',
        bind: '{settings.virtualSecret}',
        allowBlank: false,
        width: 600,
        fieldLabel: 'IPsec Secret'.t()
    },{
        xtype: 'radiogroup',
        bind: '{settings.authenticationType}',
        simpleValue: 'true',
        columns: 1,
        vertical: true,
        items: [
            { boxLabel: '<strong>' + 'Local Directory'.t() + '</strong>', inputValue: 'LOCAL_DIRECTORY' },
            { boxLabel: '<strong>' + 'RADIUS'.t() + '</strong> (' + 'requires'.t() + ' Directory Connector)', inputValue: 'RADIUS_SERVER' }
        ]
    },{
        xtype: 'button',
        iconCls: 'fa fa-cog',
        width: 200,
        bind: {
            text: '{_btnConfigureDirectory}',
        },
            handler: 'configureAuthTarget'
    },{
        xtype: 'ungrid',
        title: 'Server Listen Addresses'.t(),
        width: 300,
        height: 300,
        padding: '20 0 0 0',
        tbar: ['@addInline'],
        recordActions: ['delete'],
        listProperty: 'settings.virtualListenList.list',

        emptyRow: {
            javaClass: 'com.untangle.app.ipsec_vpn.VirtualListen',
            'address': ''
            },

        bind: '{listenList}',

    columns: [{
        header: 'Address'.t(),
        dataIndex: 'address',
        width: 150,
        flex: 1,
        editor: {
            bind: '{record.address}',
            xtype: 'textfield',
            vtype: 'ipAddress'
            }
        }]
    }]
});
