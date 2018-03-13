/**
 * Dashboard view which holds the widgets and manager
 */
Ext.define('Ung.view.dashboard.Dashboard', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ung-dashboard',
    itemId: 'dashboardMain',

    /* requires-start */
    requires: [
        'Ung.view.dashboard.DashboardController',
        'Ung.view.dashboard.Queue',
        'Ung.widget.Report',

        'Ung.widget.WidgetController',
        'Ung.widget.Information',
        'Ung.widget.Resources',
        'Ung.widget.CpuLoad',
        'Ung.widget.NetworkInformation',
        'Ung.widget.NetworkLayout',
        'Ung.widget.MapDistribution'
    ],
    /* requires-end */
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

    dockedItems: [{
        xtype: 'toolbar',
        ui: 'navigation',
        dock: 'top',
        border: false,
        style: {
            background: '#333435',
            zIndex: 9997
        },
        defaults: {
            xtype: 'button',
            border: false,
            hrefTarget: '_self'
        },
        items: Ext.Array.insert(Ext.clone(Util.subNav), 0, [{
            text: 'Manage Widgets'.t(),
            iconCls: 'fa fa-cog',
            hidden: true,
            bind: {
                userCls: '{managerVisible ? "pressed" : ""}',
                // iconCls: 'fa {!managerVisible ? "fa-arrow-left" : "fa-arrow-down" }',
                hidden: '{managerVisible}'
            },
            handler: 'toggleManager'
        }])
    }, {
        xtype: 'toolbar',
        padding: 5,
        dock: 'top',
        items: [{
            xtype: 'globalconditions',
            context: 'DASHBOARD'
        }]
    }],

    config: {
        settings: null // the dashboard settings object
    },

    layout: 'border',

    defaults: {
        border: false
    },

    items: [{
        region: 'west',
        // title: 'Manage Widgets'.t(),

        dockedItems: [{
            xtype: 'toolbar',
            border: false,
            dock: 'top',
            cls: 'report-header',
            // height: 53,
            padding: '10 5',
            items: [{
                xtype: 'component',
                html: '<h2 style="margin: 0;">' + 'Manage Widgets'.t() + '</h2>'
            }, '->', {
                xtype: 'tool',
                type: 'close',
                callback: 'toggleManager'
            }]
        }, {
            xtype: 'toolbar',
            dock: 'top',
            padding: 10,
            style: {
                background: '#FFF'
            },
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            hidden: true,
            bind: {
                hidden: '{!reportsInstalled}'
            },
            items: [{
                xtype: 'label',
                bind: {
                    html: '<strong>' + 'Timeframe'.t() + '</strong>: ' + '{timeframeText}'
                }
            }, {
                xtype: 'slider',
                bind: '{timeframe}',
                increment: 1,
                minValue: 1,
                maxValue: 24,
                publishes: 'value',
                publishOnComplete: false
            }
            // , {
            //     xtype: 'combo',
            //     itemId: 'theme',
            //     fieldLabel: 'Theme'.t(),
            //     editable: false,
            //     store: [
            //         ['DEFAULT', 'Default'.t()],
            //         ['DARK', 'Dark'.t()],
            //         ['SAND', 'Sand'.t()]
            //     ],
            //     queryMode: 'local',
            //     bind: {
            //         value: '{theme}',
            //     },
            //     allowBlank: false
            // }
            ]
        }, {
            xtype: 'toolbar',
            dock: 'top',
            ui: 'footer',
            items: [{
                itemId: 'addWidgetBtn',
                text: 'Add'.t(),
                iconCls: 'fa fa-plus-circle',
                handler: 'addWidget',
                hidden: true,
                bind: {
                    hidden: '{!reportsInstalled}'
                }
            }, '->', {
                text: 'Import'.t(),
                iconCls: 'fa fa-download',
                tooltip: 'Import'.t(),
                handler: 'importWidgets'
            }, {
                text: 'Export'.t(),
                iconCls: 'fa fa-upload',
                tooltip: 'Export'.t(),
                handler: 'exportWidgets'
            }]
        }],

        itemId: 'dashboardManager',
        reference: 'dashboardManager',
        width: 250,
        minWidth: 250,
        maxWidth: 350,
        bodyBorder: false,
        animCollapse: false,
        floatable: false,
        cls: 'widget-manager',
        split: true,
        xtype: 'grid',
        hideHeaders: true,
        hidden: true,
        bind: {
            hidden: '{!managerVisible}'
        },
        store: 'widgets',
        viewConfig: {
            plugins: {
                ptype: 'gridviewdragdrop',
                dragText: 'Drag and drop to reorganize'.t(),
                // dragZone: {
                //     onBeforeDrag: function (data, e) {
                //         return Ext.get(e.target).hasCls('drag-handle');
                //     }
                // }
            },
            stripeRows: false,
            getRowClass: function (record) {
                var cls = !record.get('enabled') ? 'disabled' : '';
                cls += record.get('markedForDelete') ? ' will-remove' : '';
                return cls;
            },
            listeners: {
                drop: 'onDrop'
            }
        },
        columns: [{
            width: 28,
            align: 'center',
            sortable: false,
            hideable: false,
            resizable: false,
            menuDisabled: true,
            //handler: 'toggleWidgetEnabled',
            dataIndex: 'enabled',
            renderer: 'enableRenderer'
        }, {
            dataIndex: 'entryId',
            renderer: 'widgetTitleRenderer',
            flex: 1
        }, {
            xtype: 'widgetcolumn',
            width: 30,
            align: 'center',
            widget: {
                xtype: 'button',
                width: 24,
                enableToggle: true,
                iconCls: 'fa fa-trash fa-gray',
                hidden: true,
                focusable: false,
                bind: {
                    hidden: '{record.type !== "ReportEntry"}',
                    iconCls: 'fa fa-trash {record.markedForDelete ? "fa-red" : "fa-gray"}',
                },
                handler: 'removeWidget'
            }
        }],
        listeners: {
            itemmouseleave : 'onItemLeave',
            cellclick: 'onItemClick'
        },
        fbar: [{
            text: 'Reset'.t(),
            iconCls: 'fa fa-rotate-left',
            handler: 'resetDashboard'
        }, '->', {
            text: 'Apply'.t(),
            iconCls: 'fa fa-floppy-o',
            handler: 'applyChanges'
        }]
    }, {
        region: 'center',
        reference: 'dashboard',
        itemId: 'dashboard',
        bodyCls: 'dashboard',
        bodyPadding: 8,
        border: false,
        bodyBorder: false,
        scrollable: true
    }],
    listeners: {
        showwidgeteditor: 'showWidgetEditor'
    }
});
