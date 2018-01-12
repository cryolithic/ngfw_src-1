/**
 * Dashboard view which holds the widgets and manager
 */
Ext.define('Ung.view.dashboard.Dashboard', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ung-dashboard',
    itemId: 'dashboard',

    controller: 'dashboard',
    viewModel: {
        data: {
            managerVisible: false,
            timeframe: 1
        },
        formulas: {
            timeframeText: function (get) {
                if (!get('timeframe')) {
                    return 1 + ' ' + 'hour'.t() + ' (' + 'default'.t() + ')';
                }
                return get('timeframe') + ' ' + (get('timeframe') === 1 ? 'hour'.t() + ' (' + 'default'.t() + ')' : 'hours'.t());
            }
        }
    },

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    defaultType: 'panel',

    items: [{
        title: 'Manager',
        docked: 'left',
        width: 250,
        resizable: {
            split: true,
            edges: 'east'
        },
        collapsible: {
            collapsed: false,
            animation: false,
            direction: 'left',
            useDrawer: false
            // dynamic: false
        },
        layout: 'fit',
        items: [{
            xtype: 'grid',
            hideHeaders: true,
            store: {
                type: 'widgets'
            },
            columns: [{
                xtype: 'checkcolumn',
                dataIndex: 'enabled',
                width: 40
            }, {
                dataIndex: 'entryId',
                flex: 1
            }]
        }]
    }, {
        title: 'content'
    }]


});
