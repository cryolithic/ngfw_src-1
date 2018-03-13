Ext.define('Ung.view.reports.Main', {
    extend: 'Ext.panel.Panel',
    xtype: 'ung.reports',
    itemId: 'reports',

    layout: 'border',

    controller: 'reports',

    viewModel: {
        data: {
            context: null,
            fetching: false,
            selection: null,
            editing: false,
            query: {},
        },
        formulas: {
            conditionsText: function (get) {
                var conds = get('query.conditions'), html = [];
                Ext.Array.each(conds, function (cond) {
                    html.push(TableConfig.getColumnHumanReadableName(cond.column) + ' ' + cond.operator + ' ' + cond.value);
                });
                if (html.length === 0) { return; }
                return 'Reports for: ' + html.join(', ');
            }
        }
    },

    dockedItems: [{
        xtype: 'toolbar',
        padding: 5,
        dock: 'top',
        items: [{
            xtype: 'globalconditions'
        }]
    }, {
        xtype: 'toolbar',
        dock: 'top',
        style: {
            zIndex: 9997
        },

        padding: 5,
        plugins: 'responsive',
        items: [{
            xtype: 'breadcrumb',
            reference: 'breadcrumb',
            store: 'reportstree',
            useSplitButtons: false,
            listeners: {
                selectionchange: function (el, node) {
                    if (!node.get('url')) { return; }
                    if (node) {
                        if (node.get('url')) {
                            Ung.app.redirectTo('#reports/' + node.get('url'));
                        } else {
                            Ung.app.redirectTo('#reports');
                        }
                    }
                }
            }
        }],
        responsiveConfig: {
            wide: { hidden: true },
            tall: { hidden: false }
        }
    }],

    items: [{
        xtype: 'treepanel',
        reference: 'tree',
        width: 250,
        region: 'west',
        split: true,
        border: false,

        singleExpand: true,
        useArrows: true,
        rootVisible: false,
        plugins: 'responsive',
        store: 'reportstree',

        bind: {
            width: '{editing ? 0 : 250}'
        },

        viewConfig: {
            selectionModel: {
                type: 'treemodel',
                pruneRemoved: false
            },
            getRowClass: function(node) {
                if (node.get('disabled')) {
                    return 'disabled';
                }
            }
        },

        dockedItems: [{
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            items: [{
                xtype: 'textfield',
                emptyText: 'Filter reports ...',
                enableKeyEvents: true,
                flex: 1,
                triggers: {
                    clear: {
                        cls: 'x-form-clear-trigger',
                        hidden: true,
                        handler: 'onTreeFilterClear'
                    }
                },
                listeners: {
                    change: 'filterTree',
                    buffer: 100
                }
            }, {
                xtype: 'button',
                iconCls: 'fa fa-plus-circle',
                text: 'Add/Import'.t(),
                hidden: true,
                bind: {
                    hidden: '{context !== "ADMIN"}'
                },
                menu: {
                    plain: true,
                    mouseLeaveDelay: 0,
                    items: [{
                        text: 'Create New'.t(),
                        iconCls: 'fa fa-plus fa-lg',
                        handler: 'newReport', // not working yet
                    }, {
                        text: 'Import'.t(),
                        iconCls: 'fa fa-download',
                        handler: 'newImport'
                    }]
                }
            }]
        }],

        columns: [{
            xtype: 'treecolumn',
            flex: 1,
            dataIndex: 'text',
            // scope: 'controller',
            renderer: 'treeNavNodeRenderer'
        }],

        listeners: {
            // prevent node selection if disabled
            beforeselect: function (el, node) {
                if (node.get('disabled')) { return false; }
            },
            // prevent node expand if disabled
            beforeitemexpand: function (node) {
                if (node.get('disabled')) { return false; }
            },
            select: 'onSelectReport'
        },

        responsiveConfig: {
            wide: { hidden: false },
            tall: { hidden: true }
        }
    }, {
        region: 'center',
        itemId: 'cards',
        reference: 'cards',
        border: false,
        layout: 'card',
        cls: 'reports-all',
        defaults: {
            border: false,
            bodyBorder: false
        },
        items: [{
            itemId: 'category',
            layout: { type: 'vbox', align: 'middle' },
            items: [{
                xtype: 'component',
                padding: '20px 0',
                cls: 'charts-bar',
                html: '<i class="fa fa-area-chart fa-2x"></i>' +
                    '<i class="fa fa-line-chart fa-2x"></i>' +
                    '<i class="fa fa-pie-chart fa-2x"></i>' +
                    '<i class="fa fa-bar-chart fa-2x"></i>' +
                    '<i class="fa fa-list-ul fa-2x"></i>' +
                    '<i class="fa fa-align-left fa-2x"></i>'
            }, {
                xtype: 'component',
                margin: '0 0 20 0',
                bind: {
                    html: '{conditionsText}'
                }
            }, {
                xtype: 'container',
                cls: 'stats',
                layout: { type: 'hbox', pack: 'center' },
                defaults: {
                    xtype: 'component',
                    cls: 'stat'
                },
                items: [{
                    hidden: true,
                    bind: {
                        hidden: '{selection}',
                        html: '<h1>{stats.categories.total}</h1>categories <p><span>{stats.categories.app} apps</span></p>'
                    }
                }, {
                    hidden: true,
                    bind: {
                        hidden: '{!selection}',
                        html: '<img src="{selection.icon}"><br/> {selection.text}'
                    }
                }, {
                    bind: {
                        html: '<h1>{stats.reports.total}</h1>reports' +
                            '<p><span>{stats.reports.chart} charts</span><br/>' +
                            '<span>{stats.reports.event} event lists</span><br/>' +
                            '<span>{stats.reports.info} summaries</span><br/>' +
                            '<span>{stats.reports.custom} custom reports</span></p>'

                    }
                }]
            }, {
                xtype: 'component',
                cls: 'pls',
                html: 'select a report from a category',
                bind: {
                    html: 'select a report from {selection.text || "a category"}'
                }
            }, {
                xtype: 'button',
                iconCls: 'fa fa-external-link-square fa-lg',
                margin: 20,
                scale: 'medium',
                handler: 'exportCategoryReports',
                text: 'Export All Reports'.t(),
                hidden: true,
                bind: {
                    text: 'Export All'.t() + ' <strong>{selection.text}</strong> ' + 'Reports'.t(),
                    hidden: '{context !== "ADMIN"}'
                }
            }]
        }, {
            xtype: 'entry',
            itemId: 'report'
        }]
    }]
});
