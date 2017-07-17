Ext.define('Ung.apps.wan-balancer.Main', {
    extend: 'Ung.cmp.AppPanel',
    alias: 'widget.app-wan-balancer',
    controller: 'app-wan-balancer',

    viewModel: {

        data: {
            autoRefresh: false,
            interfaceWeightData: [],
            destinationWanData: []
        },

        stores: {
            routeRules: {
                data: '{settings.routeRules.list}'
            },
            interfaceWeightList: {
                data: '{interfaceWeightData}'
            },
            destinationWanList: {
                fields: [ 'index', 'name' ],
                data: '{destinationWanData}'
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
                href: '#reports/wan-balancer',
                html: '<i class="fa fa-line-chart"></i> ' + 'View Reports'.t()
            }
        }]
    },

    items: [
        { xtype: 'app-wan-balancer-status' },
        { xtype: 'app-wan-balancer-trafficallocation' },
        { xtype: 'app-wan-balancer-routerules' }
    ]

});
