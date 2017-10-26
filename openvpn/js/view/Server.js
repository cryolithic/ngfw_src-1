Ext.define('Ung.apps.openvpn.view.Server', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.app-openvpn-server',
    itemId: 'server',
    title: 'Server'.t(),
    autoScroll: true,
    withValidation: true,

    viewModel: {
        formulas: {
            _btnConfigureDirectory: function (get) {
                switch (get('settings.authenticationType')) {
                case 'LOCAL_DIRECTORY': return 'Configure Local Directory'.t();
                case 'RADIUS': return 'Configure RADIUS'.t();
                case 'ACTIVE_DIRECTORY': return 'Configure Active Directory'.t();
                case 'ANY_DIRCON': return 'Configure Directory Connector'.t();
                default: return '';
                }
            }
        }
    },

    tbar: [{
        xtype: 'tbtext',
        padding: '8 5',
        style: { fontSize: '12px', fontWeight: 600 },
        html: 'The Server tab is used to configure OpenVPN to operate as a server for remote clients'.t()
    }],

    defaults: {
        labelWidth: 180,
        padding: '10 0 0 10'
    },

    items: [{
        fieldLabel: 'Server Enabled'.t(),
        xtype: 'checkbox',
        bind: '{settings.serverEnabled}'
    },{
        fieldLabel: 'Site Name'.t(),
        xtype: 'textfield',
        vtype: 'openvpnName',
        bind: '{settings.siteName}',
        allowBlank: false
    },{
        fieldLabel: 'Address Space'.t(),
        xtype: 'textfield',
        vtype: 'cidrBlock',
        bind: '{settings.addressSpace}'
    },{
        fieldLabel: 'NAT OpenVPN Traffic'.t(),
        xtype: 'checkbox',
        bind: '{settings.natOpenVpnTraffic}'
    },{
        fieldLabel: 'Site URL'.t(),
        xtype: 'displayfield',
        bind: '{getSiteUrl}'
    },{
        fieldLabel: 'Username/Password Authentication',
        xtype: 'checkbox',
        bind: '{settings.authUserPass}'
    },{
        title: 'Authentication Method'.t(),
        width: 400,
        padding: '10 0 0 20',
        bind: {
            disabled: '{!settings.authUserPass}',
            hidden: '{!settings.authUserPass}'
        },
        items: [{
            xtype: 'radiogroup',
            bind: '{settings.authenticationType}',
            simpleValue: 'true',
            columns: 1,
            vertical: true,
            items: [
                { boxLabel: '<strong>' + 'Local Directory'.t() + '</strong>', inputValue: 'LOCAL_DIRECTORY' },
                { boxLabel: '<strong>' + 'RADIUS'.t() + '</strong> (' + 'requires'.t() + ' Directory Connector)', inputValue: 'RADIUS' },
                { boxLabel: '<strong>' + 'Active Directory'.t() + '</strong> (' + 'requires'.t() + ' Directory Connector)', inputValue: 'ACTIVE_DIRECTORY' },
                { boxLabel: '<strong>' + 'Any Directory Connector'.t() + '</strong> (' + 'requires'.t() + ' Directory Connector)', inputValue: 'ANY_DIRCON' }
            ]
        }, {
            // todo: update this button later
            xtype: 'button',
            iconCls: 'fa fa-cog',
            margin: '10 0 10 10',
            bind: {
                text: '{_btnConfigureDirectory}'
            },
            handler: 'configureAuthenticationMethod'
        }]
    },{
        xtype: 'app-openvpn-server-tab-panel',
        padding: '20 20 20 20',
        border: true,
    }]
});

Ext.define('Ung.apps.openvpn.cmp.ServerTabs', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.app-openvpn-server-tab-panel',
    itemId: 'server-tab-panel',
    viewModel: true,
    layout: 'fit',

    items: [{
        title: 'Remote Clients'.t(),
        items: [
            { xtype: 'app-openvpn-remote-clients-grid' }
            ]
    },{
        title: 'Groups'.t(),
        items: [
            { xtype: 'app-openvpn-groups-grid' }
        ]
    },{
        title: 'Exported Networks'.t(),
        items: [
            { xtype: 'app-openvpn-exported-networks-grid' }
        ]
    }]

});

Ext.define('Ung.apps.openvpn.cmp.RemoteClientsGrid', {
    extend: 'Ung.cmp.Grid',
    alias: 'widget.app-openvpn-remote-clients-grid',
    itemId: 'remote-clients-grid',
    viewModel: true,
    controller: 'app-openvpn-special',

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        items: ['@add', '->', '@import', '@export']
    }],

    recordActions: ['edit', 'delete'],
    listProperty: 'settings.remoteClients.list',
    emptyRow: {
        javaClass: 'com.untangle.app.openvpn.OpenVpnRemoteClient',
        'enabled': true,
        'name': '',
        'groupId': 1,
        'export': false,
        'existing': false
        },

    bind: '{remoteClients}',

    columns: [{
        xtype: 'checkcolumn',
        header: 'Enabled'.t(),
        width: 80,
        dataIndex: 'enabled',
        resizable: false
    }, {
        header: 'Client Name'.t(),
        width: 150,
        flex: 1,
        dataIndex: 'name',
    }, {
        header: 'Group'.t(),
        width: 120,
        dataIndex: 'groupId',
        renderer: function(value, meta, record, row, col, store, grid) {
            var groupList = this.getViewModel().get('groups');
            var grpname = 'Unknown'.t();
            groupList.each(function(record) { if (record.get('groupId') == value) grpname = record.get('name'); });
            return(grpname);
        }
    }, {
        xtype: 'actioncolumn',
        header: 'Download Client'.t(),
        width: 120,
        iconCls: 'fa fa-download',
        align: 'center',
        handler: 'downloadClient',
    }],

    editorFields: [{
        xtype: 'checkbox',
        fieldLabel: 'Enabled'.t(),
        bind: '{record.enabled}'
    }, {
        xtype: 'textfield',
        vtype: 'openvpnName',
        fieldLabel: 'Client Name'.t(),
        allowBlank: false,
        bind: {
            value: '{record.name}',
            readOnly: '{record.existing}'
        }
    }, {
        xtype: 'combobox',
        fieldLabel: 'Group'.t(),
        bind: {
            value: '{record.groupId}',
            store: '{groups}'
        },
        allowBlank: false,
        editable: false,
        queryMode: 'local',
        displayField: 'name',
        valueField: 'groupId'
    }, {
        xtype: 'combo',
        fieldLabel: 'Type'.t(),
        editable: false,
        bind: '{record.export}',
        store: [[false,'Individual Client'.t()],[true,'Network'.t()]]
    }, {
        xtype: 'textfield',
        fieldLabel: 'Remote Networks'.t(),
        bind: {
            value: '{record.exportNetwork}',
            disabled: '{!record.export}',
            hidden: '{!record.export}'
        },
        allowBlank: false,
        vtype: 'cidrBlockList'
    }]

});

Ext.define('Ung.apps.openvpn.cmp.GroupsGrid', {
    extend: 'Ung.cmp.Grid',
    alias: 'widget.app-openvpn-groups-grid',
    itemId: 'groups-grid',
    viewModel: true,

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        items: ['@add', '->', '@import', '@export']
    }],

    recordActions: ['edit', 'delete'],
    listProperty: 'settings.groups.list',
    emptyRow: {
        javaClass: 'com.untangle.app.openvpn.OpenVpnGroup',
        'enabled': true,
        'name': '',
        'groupId': -1,
        'export': false
        },

    bind: '{groups}',

    columns: [{
        header: 'Group Name'.t(),
        allowBlank: false,
        width: 150,
        flex: 1,
        dataIndex: 'name',
    }, {
        header: 'Full Tunnel'.t(),
        width: 120,
        dataIndex: 'fullTunnel',
    }, {
        header: 'Push DNS'.t(),
        width: 120,
        dataIndex: 'pushDns'
    }],

    editorFields: [{
        xtype: 'textfield',
        fieldLabel: 'Group Name'.t(),
        bind: '{record.name}'
    }, {
        xtype: 'checkbox',
        fieldLabel: 'Full Tunnel'.t(),
        bind: '{record.fullTunnel}'
    }, {
        xtype: 'checkbox',
        fieldLabel: 'Push DNS'.t(),
        bind: '{record.pushDns}'
    }, {
        xtype: 'displayfield',
        value: '<STRONG>' + 'Push DNS Configuration'.t() + '</STRONG>',
        bind: {
            hidden: '{!record.pushDns}'
        }
    }, {
        xtype:'combo',
        fieldLabel: 'Push DNS Server'.t(),
        editable: false,
        store: [[true,'OpenVPN Server'.t()],[false,'Custom'.t()]],
        bind: {
            value: '{record.pushDnsSelf}',
            hidden:'{!record.pushDns}'
        }
    }, {
        xtype: 'textfield',
        fieldLabel: 'Push DNS Custom 1'.t(),
        bind: {
            value: '{record.pushDns1}',
            disabled: '{record.pushDnsSelf}',
            hidden:'{!record.pushDns}'
        }
    }, {
        xtype: 'textfield',
        fieldLabel: 'Push DNS Custom 2'.t(),
        bind: {
            value: '{record.pushDns2}',
            disabled: '{record.pushDnsSelf}',
            hidden:'{!record.pushDns}'
        }
    }, {
        xtype:'textfield',
        fieldLabel: 'Push DNS Domain'.t(),
        bind: {
            value: '{record.pushDnsDomain}',
            hidden:'{!record.pushDns}'
        }
    }]

});

Ext.define('Ung.apps.openvpn.cmp.ExportedNetworksGrid', {
    extend: 'Ung.cmp.Grid',
    alias: 'widget.app-openvpn-exported-networks-grid',
    itemId: 'exported-clients-grid',
    viewModel: true,

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        items: ['@add', '->', '@import', '@export']
    }],

    recordActions: ['edit', 'delete'],
    listProperty: 'settings.exports.list',
    emptyRow: {
        javaClass: 'com.untangle.app.openvpn.OpenVpnExport',
        'enabled': true,
        'name': '',
        'network': ''
        },

    bind: '{exportedNetworks}',

    columns: [{
        xtype: 'checkcolumn',
        header: 'Enabled'.t(),
        width: 80,
        dataIndex: 'enabled',
        resizable: false
    }, {
        header: 'Export Name'.t(),
        width: 150,
        flex: 1,
        dataIndex: 'name',
    }, {
        header: 'Network'.t(),
        width: 150,
        dataIndex: 'network',
    }],

    editorFields: [{
        xtype: 'checkbox',
        bind: '{record.enabled}',
        fieldLabel: 'Enabled'.t()
    }, {
        xtype: 'textfield',
        bind: '{record.name}',
        allowBlank: false,
        fieldLabel: 'Export Name'.t()
    }, {
        xtype:'textfield',
        vtype: 'cidrBlock',
        allowBlank: false,
        fieldLabel: 'Network'.t(),
        bind: '{record.network}'
    }]

});
