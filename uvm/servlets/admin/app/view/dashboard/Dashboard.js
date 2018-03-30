/**
 * Dashboard view which holds the widgets and manager
 */
Ext.define('Ung.view.dashboard.Dashboard', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ung-dashboard',
    itemId: 'dashboardMain',

    controller: 'dashboard',
    viewModel: {
        data: {
            visibleSide: null,
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
    // border: false,
    config: {
        settings: null // the dashboard settings object / not used, need to check
    },

    layout: 'fit',

    defaults: {
        border: false
    },

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        ui: 'footer',
        height: 30,
        style: { background: '#D8D8D8' },
        defaults: {
            focusable: false
        },
        items: [{
            xtype: 'segmentedbutton',
            reference: 'sideviews',
            allowMultiple: false,
            allowDepress: true,
            defaults: {
                focusable: false
            },
            items: [{
                text: 'Settings'.t(),
                iconCls: 'fa fa-cog',
                value: 'settings'
            }, {
                text: 'System Info'.t(),
                iconCls: 'fa fa-info-circle',
                value: 'info'
            }]
        }, {
            xtype: 'globalconditions',
            context: 'DASHBOARD',
            hidden: true,
            bind: {
                hidden: '{!reportsAppStatus.installed || !reportsAppStatus.enabled}'
            }
        }, {
            xtype: 'container',
            itemId: 'since',
            margin: '0 5',
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            hidden: true,
            bind: {
                hidden: '{!reportsAppStatus.installed || !reportsAppStatus.enabled}'
            },
            items: [{
                xtype: 'component',
                margin: '0 5 0 0',
                style: {
                    fontSize: '11px'
                },
                html: '<strong>' + 'Since:'.t() + '</strong>'
            }, {
                xtype: 'button',
                iconCls: 'fa fa-clock-o',
                text: 'Today'.t(),
                focusable: false,
                menu: {
                    plain: true,
                    showSeparator: false,
                    mouseLeaveDelay: 0,
                    items: [
                        { text: '1 Hour ago'.t(), value: 1 },
                        { text: '3 Hours ago'.t(), value: 3 },
                        { text: '6 Hours ago'.t(), value: 6 },
                        { text: '12 Hours ago'.t(), value: 12 },
                        { text: '24 Hours ago'.t(), value: 24 }
                    ],
                    listeners: {
                        click: 'updateSince'
                    }
                }
            }],
        }, {
            xtype: 'component',
            style: { fontSize: '12px' },
            html: '<i class="fa fa-info-circle"></i> <strong>Reports App not installed!</strong> Report based widgets are not available.',
            hidden: true,
            bind: {
                hidden: '{reportsAppStatus.installed}'
            }
        }, {
            xtype: 'component',
            style: { fontSize: '12px' },
            html: '<i class="fa fa-info-circle"></i> <strong>Reports App is disabled!</strong> Report based widgets are not available.',
            hidden: true,
            bind: {
                hidden: '{!reportsAppStatus.installed || reportsAppStatus.enabled}'
            }
        }]
    }, {
        xtype: 'dashboardinfo',
        dock: 'left',
        width: 270,
        hidden: true,
        bind: {
            hidden: '{sideviews.value !== "info"}'
        }
    }, {
        xtype: 'dashboardmanager',
        dock: 'left',
        width: 270,
        hidden: true,
        bind: {
            hidden: '{sideviews.value !== "settings"}'
        }
    }],

    items: [{
        reference: 'dashboard',
        itemId: 'dashboard',
        bodyCls: 'dashboard',
        bodyPadding: '20',
        border: false,
        bodyBorder: false,
        scrollable: true,
    }],
    listeners: {
        showwidgeteditor: 'showWidgetEditor'
    }
});
