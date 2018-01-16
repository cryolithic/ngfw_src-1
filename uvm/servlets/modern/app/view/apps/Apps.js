Ext.define('Ung.view.apps.Apps', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ung-apps',
    // itemId: 'apps',
    layout: 'card',
    // layout: 'border',

    // itemType: rpc.skinInfo.appsViewType === 'rack' ? 'rackitem' : 'simpleitem',

    // controller: 'apps',
    viewModel: {
        data: {
            onInstalledApps: true,
            policyName: '',
            appsCount: 0,
            servicesCount: 0
        },
        stores: {
            installableApps: {
                sorters: [ { property: 'viewPosition', direction: 'ASC' }],
            },
            installableServices: {
                sorters: [ { property: 'viewPosition', direction: 'ASC' }]
            }
        }
    },

    defaults: {
        border: false
    },

    items: [{
        itemId: 'installedApps',
        xtype: 'panel',
        // region: 'center',
    }]
});
