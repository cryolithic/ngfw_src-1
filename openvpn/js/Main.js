Ext.define('Ung.apps.openvpn.Main', {
    extend: 'Ung.cmp.AppPanel',
    alias: 'widget.app-openvpn',
    controller: 'app-openvpn',

    viewModel: {
        stores: {
            remoteClients: {
                data: '{settings.remoteClients.list}'
            },
            remoteServers: {
                data: '{settings.remoteServers.list}'
            },
            groups: {
                data:'{settings.groups.list}'
            },
            exportedNetworks: {
                data:'{settings.exports.list}'
            },
            serverConfiguration: {
                data: '{settings.serverConfiguration.list}'
            },
            clientConfiguration: {
                data: '{settings.clientConfiguration.list}'
            },
            clientStatusList: {
                data: '{clientStatusData}',
                fields: [{
                    name: 'address',
                    type: 'string',
                    sortType: 'asIp'
                },{
                    name: 'clientName',
                    type: 'string',
                    sortType: 'asUnString'
                },{
                    name: 'start',
                    sortType: 'asTimestamp'
                },{
                    name: 'poolAddress',
                    type: 'string',
                    sortType: 'asIp'
                }]
            },
            serverStatusList: {
                data: '{serverStatusData}',
                filters: [{
                    property: 'enabled',
                    value: true
                }]
            }

        },

        data: {
            clientStatusData: [],
            serverStatusData: [],
        },

        formulas: {
            getSiteUrl: {
                get: function(get) {
                    var publicUrl = Rpc.directData('rpc.networkManager.getPublicUrl');
                    return(publicUrl.split(":")[0] + ":" + get('settings.port'));
                }
            }
        }
    },

    tabBar: {
        items: [{
            xtype: 'component',
            margin: '0 0 0 10',
            cls: 'view-reports',
            autoEl: {
                tag: 'a',
                href: '#reports/openvpn',
                html: '<i class="fa fa-line-chart"></i> ' + 'View Reports'.t()
            },
            hidden: true,
            bind: {
                hidden: '{!reportsEnabled || instance.runState !== "RUNNING"}'
            }
        }]
    },

    items: [
        { xtype: 'app-openvpn-status' },
        { xtype: 'app-openvpn-server' },
        { xtype: 'app-openvpn-client' },
        { xtype: 'app-openvpn-advanced' }
    ]

});
