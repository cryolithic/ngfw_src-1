/**
 * Dashboard view which holds the widgets and manager
 */
Ext.define('Ung.view.dashboard.Dashboard', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ung-dashboard',
    // itemId: 'dashboard',

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
        width: 350,
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
            xtype: 'toolbar',
            docked: 'top',
            margin: 0,
            items: [{
                iconCls: 'x-fa fa-plus',
                ui: 'round',
                tooltip: {
                    html: 'Add Widget'.t(),
                    anchor: true,
                    align: 'tc-bc'
                }
            }, '->', {
                iconCls: 'x-fa fa-download',
                ui: 'round',
                tooltip: {
                    html: 'Import'.t(),
                    anchor: true,
                    align: 'tc-bc'
                }
            }, {
                iconCls: 'x-fa fa-upload',
                ui: 'round',
                tooltip: {
                    html: 'Export'.t(),
                    anchor: true,
                    align: 'tc-bc'
                }
            }]
        }, {
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
                renderer: 'widgetTitleRenderer',
                flex: 1,
                cell: {
                    encodeHtml: false
                }
            }]
        }]
    }, {
        html: 'Widgets here'
    }]


});
