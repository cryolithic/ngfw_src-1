Ext.define('Ung.view.reports.EntrySettings', {
    extend: 'Ext.window.Window',
    alias: 'widget.entrysettings',

    controller: 'entrysettings',

    renderTo: Ext.getBody(),

    viewModel: {
        stores: {
            textColumnsStore: {
                data: '{textColumns}',
                listeners: {
                    datachanged: 'onTextColumnsChanged',
                    update: 'onTextColumnsChanged'
                }
            },
            timeDataColumnsStore: {
                data: '{timeDataColumns}',
                listeners: {
                    datachanged: 'onTimeDataColumnsChanged',
                    update: 'onTimeDataColumnsChanged'
                }
            }
        },
        formulas: {
            f_activeReportCard: function (get) {
                var activeCard;
                switch(get('entry.type')) {
                case 'TEXT': activeCard = 'textreport'; break;
                case 'EVENT_LIST': activeCard = 'eventreport'; break;
                default: activeCard = 'graphreport';
                }
                return activeCard;
            },
            f_tableColumns: function (get) {
                var table = get('eEntry.table'), tableConfig, defaultColumns;

                if (!table) { return []; }

                tableConfig = TableConfig.generate(table);

                if (get('eEntry.type') !== 'EVENT_LIST') {
                    return tableConfig.comboItems;
                }

                // for EVENT_LIST setup the columns
                defaultColumns = Ext.clone(get('eEntry.defaultColumns'));

                // initially set none as default
                Ext.Array.each(tableConfig.comboItems, function (item) {
                    item.isDefault = false;
                });

                Ext.Array.each(get('eEntry.defaultColumns'), function (defaultColumn) {
                    var col = Ext.Array.findBy(tableConfig.comboItems, function (item) {
                        return item.value === defaultColumn;
                    });
                    // remove default columns if not in TableConfig
                    if (!col) {
                        // vm.set('eEntry.defaultColumns', Ext.Array.remove(defaultColumns, defaultColumn));
                    } else {
                        // otherwise set it as default
                        col.isDefault = true;
                    }
                });
                return tableConfig.comboItems;
            },
            f_approximation: {
                get: function (get) {
                    return get('eEntry.approximation') || 'sum';
                },
                set: function (value) {
                    this.set('eEntry.approximation', value !== 'sum' ? value : null);
                }
            },
        }
    },

    modal: true,
    width: 1200,
    height: 700,
    closeAction: 'hide',
    layout: 'fit',
    border: false,
    bodyBorder: false,
    bodyStyle: { background: '#FFF' },

    title: 'Edit Report'.t(),

    items: [{
        /**
         * cards region containing the actual report (text, graph, events, invalid report message)
         */
        xtype: 'panel',
        border: false,
        bodyBorder: false,
        itemId: 'reportCard',
        layout: 'card',
        bind: {
            activeItem: '{f_activeReportCard}'
        },
        items: [{
            xtype: 'graphreport',
            itemId: 'graphreport',
            renderInReports: true
        }, {
            xtype: 'eventreport',
            itemId: 'eventreport',
            renderInReports: true
        }, {
            xtype: 'textreport',
            itemId: 'textreport',
            renderInReports: true
        }, {
            // itemId: 'invalidreport',
            xtype: 'component',
            cls: 'invalidreport',
            // border: false,
            // layout: 'center',
            // items: [{
            //     xtype: 'component',
            html: '<i class="fa fa-exclamation-triangle fa-2x fa-orange"></i><p>Fill all the required settings then click "Preview/Refresh"!</p>',
            bind: {
                userCls: '{!validForm ? "invalid" : ""}'
            }
            // }]
        }],

        dockedItems: [{
            xtype: 'component',
            dock: 'top',
            cls: 'report-header',
            padding: '5 10',
            // weight: -20,
            bind: {
                html: '<h2><span>{eEntry.category || "category"} /</span> {eEntry.title || "title"}</h2><p>{eEntry.description}</p>',
            }
        }, {
            xtype: 'container',
            dock: 'right',
            width: 250,
            weight: -10,
            layout: 'fit',
            items: [{
                xtype: 'panel',
                layout: 'anchor',
                scrollable: true,
                bodyPadding: '10',
                // bodyStyle: { background: '#EEE' },
                defaults: {
                    labelAlign: 'top',
                    anchor: '100%',
                    labelWidth: 120,
                    // padding: '5 20',
                    // labelStyle: 'font-weight: bold;'
                },
                items: [{
                    xtype: 'textfield',
                    itemId: 'report_title',
                    fieldLabel: '<strong>' + 'Title'.t() + '</strong>',
                    anchor: '100%',
                    hidden: true,
                    bind: {
                        value: '{eEntry.title}',
                        hidden: '{!eEntry}'
                    },
                    valuePublishEvent: 'blur', // update binding on blur only
                    allowBlank: false,
                    emptyText: 'Enter Report Title ...'.t()
                }, {
                    xtype: 'combo',
                    itemId: 'categoryCombo',
                    editable: false,
                    fieldLabel: '<strong>' + 'Category'.t() + '</strong>',
                    anchor: '100%',
                    displayField: 'displayName',
                    tpl: '<ul class="x-list-plain"><tpl for=".">' +
                            '<li role="option" class="x-boundlist-item"><img src="{icon}" style="width: 16px; height: 16px; vertical-align: middle;"> {displayName}</li>' +
                            '</tpl></ul>',
                    store: 'categories',
                    queryMode: 'local',
                    allowBlank: false,
                    emptyText: 'Select a Category ...'.t(),
                    hidden: true,
                    bind: {
                        value: '{eEntry.category}',
                        hidden: '{!eEntry}'
                    }
                }, {
                    xtype: 'textarea',
                    grow: true,
                    fieldLabel: '<strong>' + 'Description'.t() + '</strong>',
                    anchor: '100%',
                    hidden: true,
                    // allowBlank: false,
                    emptyText: 'Add a description ...'.t(),
                    valuePublishEvent: 'blur',
                    bind: {
                        value: '{eEntry.description}',
                        hidden: '{!eEntry}'
                    }
                }, {
                    xtype: 'combo',
                    fieldLabel: '<strong>' + 'Report Type'.t() + '</strong>',
                    anchor: '100%',
                    publishes: 'value',
                    editable: false,
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'value',
                    allowBlank: false,
                    emptyText: 'Select Report Type ...'.t(),
                    store: {
                        data: [
                            { name: 'Text'.t(), value: 'TEXT' },
                            { name: 'Pie Graph'.t(), value: 'PIE_GRAPH' },
                            { name: 'Time Graph'.t(), value: 'TIME_GRAPH' },
                            { name: 'Time Graph Dynamic'.t(), value: 'TIME_GRAPH_DYNAMIC' },
                            { name: 'Event List'.t(), value: 'EVENT_LIST' },
                        ]
                    },
                    hidden: true,
                    bind: {
                        value: '{eEntry.type}',
                        hidden: '{!eEntry}'
                    }
                }, {
                    // TEXT
                    xtype: 'textarea',
                    anchor: '100%',
                    fieldLabel: 'Text String'.t(),
                    bind: {
                        value: '{eEntry.textString}',
                        hidden: '{eEntry.type !== "TEXT"}',
                        disabled: '{eEntry.type !== "TEXT"}'
                    },
                    allowBlank: false
                },

                /** PIE_GRAPH settings down */
                {
                    xtype: 'combo',
                    fieldLabel: 'Pie Group Column'.t(),
                    margin: '5 0',
                    typeAhead: true,
                    hideTrigger: true,
                    displayField: 'value',
                    valueField: 'value',
                    bind: {
                        store: { data: '{f_tableColumns}' },
                        value: '{eEntry.pieGroupColumn}',
                        hidden: '{eEntry.type !== "PIE_GRAPH"}',
                        disabled: '{eEntry.type !== "PIE_GRAPH"}'
                    },
                    queryMode: 'local',
                    allowBlank: false,
                    emptyText: 'Column Id or custom value'.t()
                }, {
                    xtype: 'combo',
                    fieldLabel: 'Pie Sum Column'.t(),
                    margin: '5 0',
                    typeAhead: true,
                    hideTrigger: true,
                    displayField: 'value',
                    valueField: 'value',
                    bind: {
                        store: { data: '{f_tableColumns}' },
                        value: '{eEntry.pieSumColumn}',
                        hidden: '{eEntry.type !== "PIE_GRAPH"}',
                        disabled: '{eEntry.type !== "PIE_GRAPH"}'
                    },
                    queryMode: 'local',
                    allowBlank: false,
                    emptyText: 'Column Id or custom value (e.g. count(*))'.t()
                }, {
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Order By Column'.t(),
                    allowBlank: false,
                    bind: {
                        hidden: '{eEntry.type !== "PIE_GRAPH"}',
                        disabled: '{eEntry.type !== "PIE_GRAPH"}'
                    },
                    layout: { type: 'hbox', align: 'middle' },
                    items: [{
                        xtype: 'textfield',
                        flex: 1,
                        emptyText: 'Column Id or custom value',
                        allowBlank: false,
                        bind: {
                            value: '{eEntry.orderByColumn}'
                        }
                    }, {
                        xtype: 'segmentedbutton',
                        margin: '0 0 0 5',
                        items: [
                            { text: 'Asc'.t(), iconCls: 'fa fa-arrow-up', value: true },
                            { text: 'Desc'.t(), iconCls: 'fa fa-arrow-down' , value: false }
                        ],
                        bind: {
                            value: '{eEntry.orderDesc}'
                        }
                    }]
                }, {
                    xtype: 'combo',
                    fieldLabel: 'Graph Style'.t(),
                    editable: false,
                    store: [
                        ['PIE', 'Pie'.t()],
                        ['PIE_3D', 'Pie 3D'.t()],
                        ['DONUT', 'Donut'.t()],
                        ['DONUT_3D', 'Donut 3D'.t()],
                        ['COLUMN', 'Column'.t()],
                        ['COLUMN_3D', 'Column 3D'.t()]
                    ],
                    queryMode: 'local',
                    bind: {
                        value: '{eEntry.pieStyle}',
                        hidden: '{eEntry.type !== "PIE_GRAPH"}',
                        disabled: '{eEntry.type !== "PIE_GRAPH"}'
                    },
                    allowBlank: false,
                    emptyText: 'Select Style ...'.t()
                }, {
                    // PIE_GRAPH
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Pie Slices Number'.t(),
                    layout: {
                        type: 'hbox',
                        align: 'middle'
                    },
                    items: [{
                        xtype: 'slider',
                        flex: 1,
                        reference: 'pieNumSlices',
                        minValue: 1,
                        maxValue: 25,
                        increment: 1,
                        publishes: 'value',
                        publishOnComplete: true,
                        bind: {
                            value: '{eEntry.pieNumSlices}',
                        },
                        tipText: function (thumb) {
                            return String(thumb.value) + ' ' + 'slices'.t();
                        }
                    }, {
                        xtype: 'component',
                        width: 80,
                        margin: '0 0 0 10',
                        bind: {
                            html: '<strong>{pieNumSlices.value} ' + 'slices'.t() + '</strong>'
                        }
                    }],
                    bind: {
                        hidden: '{eEntry.type !== "PIE_GRAPH"}',
                        disabled: '{eEntry.type !== "PIE_GRAPH"}'
                    }
                },
                /** PIE_GRAPH settings up */

                /** TIME_GRAPH_DYNAMIC settings down */
                {
                    xtype: 'combo',
                    fieldLabel: 'Dynamic Column'.t(),
                    // margin: '5 0',
                    publishes: 'value',
                    allowBlank: false,
                    emptyText: 'Select Column ...'.t(),
                    editable: false,
                    queryMode: 'local',
                    displayField: 'value',
                    valueField: 'value',
                    bind: {
                        store: { data: '{f_tableColumns}' },
                        value: '{eEntry.timeDataDynamicColumn}',
                        hidden: '{eEntry.type !== "TIME_GRAPH_DYNAMIC"}',
                        disabled: '{eEntry.type !== "TIME_GRAPH_DYNAMIC"}'
                    },
                    displayTpl: '<tpl for=".">{text} [{value}]</tpl>',
                    listConfig: {
                        itemTpl: ['<div data-qtip="{value}"><strong>{text}</strong> <span style="float: right;">[{value}]</span></div>']
                    }
                }, {
                    xtype: 'combo',
                    fieldLabel: 'Dynamic Value'.t(),
                    margin: '5 0',
                    typeAhead: true,
                    hideTrigger: true,
                    displayField: 'value',
                    valueField: 'value',
                    bind: {
                        store: { data: '{f_tableColumns}' },
                        value: '{eEntry.timeDataDynamicValue}',
                        hidden: '{eEntry.type !== "TIME_GRAPH_DYNAMIC"}',
                        disabled: '{eEntry.type !== "TIME_GRAPH_DYNAMIC"}'
                    },
                    queryMode: 'local',
                    allowBlank: false,
                    emptyText: 'Column Id or custom value'
                }, {
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Dynamic Limit'.t(),
                    layout: { type: 'hbox', align: 'middle' },
                    items: [{
                        xtype: 'numberfield',
                        width: 70,
                        allowBlank: false,
                        disabled: true,
                        bind: {
                            value: '{eEntry.timeDataDynamicLimit}',
                            disabled: '{eEntry.type !== "TIME_GRAPH_DYNAMIC"}'
                        }
                    }, {
                        xtype: 'component',
                        padding: '0 5',
                        html: '<i class="fa fa-info-circle fa-gray" data-qtip="e.g. 10"></i>'
                    }],
                    disabled: false,
                    bind: {
                        hidden: '{eEntry.type !== "TIME_GRAPH_DYNAMIC"}'
                    }
                }, {
                    xtype: 'combo',
                    fieldLabel: 'Aggregation Function'.t(),
                    store: [
                        ['avg', 'Average'.t()],
                        ['count', 'Count'.t()],
                        ['sum', 'Sum'.t()],
                        ['min', 'Min'.t()],
                        ['max', 'Max'.t()]
                    ],
                    editable: false,
                    allowBlank: false,
                    emptyText: 'Select Aggregation Method ...'.t(),
                    queryMode: 'local',
                    bind: {
                        value: '{eEntry.timeDataDynamicAggregationFunction}',
                        hidden: '{eEntry.type !== "TIME_GRAPH_DYNAMIC"}',
                        disabled: '{eEntry.type !== "TIME_GRAPH_DYNAMIC"}'
                    }
                }, {
                    // TIME_GRAPH, TIME_GRAPH_DYNAMIC
                    xtype: 'combo',
                    fieldLabel: 'Graph Style'.t(),
                    editable: false,
                    store: [
                        ['LINE', 'Line'.t()],
                        ['AREA', 'Area'.t()],
                        ['AREA_STACKED', 'Stacked Area'.t()],
                        ['BAR', 'Column'.t()],
                        ['BAR_OVERLAPPED', 'Overlapped Columns'.t()],
                        ['BAR_STACKED', 'Stacked Columns'.t()]
                    ],
                    queryMode: 'local',
                    bind: {
                        value: '{eEntry.timeStyle}',
                        hidden: '{eEntry.type !== "TIME_GRAPH" && eEntry.type !== "TIME_GRAPH_DYNAMIC"}',
                        disabled: '{eEntry.type !== "TIME_GRAPH" && eEntry.type !== "TIME_GRAPH_DYNAMIC"}'
                    },
                    allowBlank: false,
                    emptyText: 'Select Style ...'.t()
                }, {
                    // TIME_GRAPH, TIME_GRAPH_DYNAMIC
                    xtype: 'combo',
                    fieldLabel: 'Time Data Interval'.t(),
                    editable: false,
                    store: [
                        ['AUTO', 'Auto'.t()],
                        ['SECOND', 'Second'.t()],
                        ['MINUTE', 'Minute'.t()],
                        ['HOUR', 'Hour'.t()],
                        ['DAY', 'Day'.t()],
                        ['WEEK', 'Week'.t()],
                        ['MONTH', 'Month'.t()]
                    ],
                    queryMode: 'local',
                    bind: {
                        value: '{eEntry.timeDataInterval}',
                        hidden: '{eEntry.type !== "TIME_GRAPH" && eEntry.type !== "TIME_GRAPH_DYNAMIC"}',
                        disabled: '{eEntry.type !== "TIME_GRAPH" && eEntry.type !== "TIME_GRAPH_DYNAMIC"}'
                    },
                    allowBlank: false,
                    emptyText: 'Select the Time Interval ...'.t()
                }, {
                    // TIME_GRAPH, TIME_GRAPH_DYNAMIC
                    xtype: 'combo',
                    fieldLabel: 'Approximation'.t(),
                    editable: false,
                    store: [
                        ['average', 'Average'.t()],
                        ['high', 'High'.t()],
                        ['low', 'Low'.t()],
                        ['sum', 'Sum'.t() + ' (' + 'default'.t() + ')'] // default
                    ],
                    queryMode: 'local',
                    bind: {
                        value: '{f_approximation}',
                        hidden: '{eEntry.type !== "TIME_GRAPH" && eEntry.type !== "TIME_GRAPH_DYNAMIC"}',
                        disabled: '{eEntry.type !== "TIME_GRAPH" && eEntry.type !== "TIME_GRAPH_DYNAMIC"}'
                    },
                    allowBlank: false,
                    emptyText: 'Select Approximation ...'.t()
                },
                /** TIME_GRAPH_DYNAMIC settings up */

                /** ALL GRAPHS settings down */
                {
                    xtype: 'textfield',
                    fieldLabel: 'Units'.t(),
                    allowBlank: false,
                    emptyText: 'Enter Units ... (e.g. sessions, bytes/s)'.t(),
                    bind: {
                        value: '{eEntry.units}',
                        hidden: '{eEntry.type !== "TIME_GRAPH" && eEntry.type !== "TIME_GRAPH_DYNAMIC" && eEntry.type !== "PIE_GRAPH"}',
                        disabled: '{eEntry.type !== "TIME_GRAPH" && eEntry.type !== "TIME_GRAPH_DYNAMIC" && eEntry.type !== "PIE_GRAPH"}'
                    }
                }, {
                    xtype: 'combo',
                    fieldLabel: 'Series Renderer'.t(),
                    store: Renderer.forReports,
                    editable: false,
                    queryMode: 'local',
                    bind: {
                        value: '{eEntry.seriesRenderer}',
                        hidden: '{eEntry.type !== "TIME_GRAPH" && eEntry.type !== "TIME_GRAPH_DYNAMIC" && eEntry.type !== "PIE_GRAPH"}',
                        disabled: '{eEntry.type !== "TIME_GRAPH" && eEntry.type !== "TIME_GRAPH_DYNAMIC" && eEntry.type !== "PIE_GRAPH"}'
                    }
                }, {
                    // PIE_GRAPH, TIME_GRAPH, TIME_GRAPH_DYNAMIC
                    xtype: 'colorspicker',
                    fieldLabel: 'Colors'.t(),
                    pickerAlign: 'bl-tl',
                    emptyText: 'Using default colors'.t(),
                    bind: {
                        value: '{eEntry.colors}',
                        hidden: '{eEntry.type !== "PIE_GRAPH" && eEntry.type !== "TIME_GRAPH" && eEntry.type !== "TIME_GRAPH_DYNAMIC"}',
                        disabled: '{eEntry.type !== "PIE_GRAPH" && eEntry.type !== "TIME_GRAPH" && eEntry.type !== "TIME_GRAPH_DYNAMIC"}'
                    }
                }, {
                    xtype: 'numberfield',
                    fieldLabel: 'Display Order'.t(),
                    anchor: '50%',
                    bind: '{eEntry.displayOrder}',
                    hidden: false,
                    disabled: false
                }, {
                    xtype: 'component',
                    margin: '15 0',
                    style: {
                        textAlign: 'center'
                    },
                    html: '<i class="fa fa-info-circle fa-lg fa-gray"></i> ' + 'Select default columns to show from the "Data Source" panel'.t(),
                    disabled: false,
                    bind: {
                        hidden: '{eEntry.type !== "EVENT_LIST"}',
                    }
                }, {
                    // used for validating text columns
                    xtype: 'textfield',
                    hidden: true,
                    bind: {
                        value: '{textColumnsCount}',
                        disabled: '{eEntry.type !== "TEXT"}'
                    },
                    validator: function(val) {
                        return val > 0;
                    }
                }, {
                    // used for validating time columns
                    xtype: 'textfield',
                    hidden: true,
                    bind: {
                        value: '{timeDataColumnsCount}',
                        disabled: '{eEntry.type !== "TIME_GRAPH"}'
                    },
                    validator: function(val) {
                        return val > 0;
                    }
                }]
            }]




            // items: [{
            //     /**
            //      * Notification for readonly or custom report
            //      */
            //     xtype: 'component',
            //     padding: '10',
            //     hidden: true,
            //     style: {
            //         background: '#F9FFA8'
            //     },
            //     bind: {
            //         hidden: '{!eEntry.readOnly}'
            //     },
            //     html: '<i class="fa fa-info-circle fa-lg"></i> ' + 'This is a default <strong>read-only</strong> report. Any changes can be saved as a New Report with a different title.'
            // }, {
            //     // border: false,
            //     // bodyBorder: false,
            //     bodyPadding: 10,

            // }]
        }, {
            /**
             * south border region width entry data source and sql conditions etc...
             */
            dock: 'bottom',
            height: 250,
            split: true,
            layout: 'border',
            items: [{
                region: 'center',
                itemId: 'tableColumns',
                xtype: 'grid',
                // weight: 25,
                // title: '<i class="fa fa-database"></i> ' + 'Data Source'.t(),
                split: true,
                sortableColumns: false,
                disableSelection: true,
                enableColumnHide: false,
                columnLines: true,
                border: false,
                viewConfig: {
                    enableTextSelection: true,
                    stripeRows: false
                },
                // selType: 'checkboxmodel',
                bind: {
                    store: {
                        data: '{f_tableColumns}',
                        listeners: {
                            update: function (grid, column) {
                                Ext.fireEvent('defaultcolumnschange', column);
                            }
                        }
                    }
                },
                columns: [{
                    xtype: 'checkcolumn',
                    header: '',
                    dataIndex: 'isDefault',
                    width: 25,
                    hidden: true,
                    bind: {
                        hidden: '{eEntry.type !== "EVENT_LIST"}'
                    }
                }, {
                    header: 'Column Name [Column Id]'.t(),
                    dataIndex: 'value',
                    flex: 1,
                    renderer: function (val, meta, record) {
                        return record.get('text') + ' [<strong>' + val + '</strong>]';
                    }
                }],
                dockedItems: [{
                    // ALL
                    xtype: 'toolbar',
                    dock: 'top',
                    // padding: 5,
                    // border: false,
                    // ui: 'footer',
                    items: [{
                        xtype: 'combo',
                        flex: 1,
                        fieldLabel: 'Data Table'.t(),
                        fieldStyle: 'font-weight: bold',
                        labelAlign: 'right',
                        bind: {
                            value: '{eEntry.table}',
                            store: '{tables}'
                        },
                        editable: false,
                        queryMode: 'local',
                        allowBlank: false,
                        emptyText: 'Select Table ...'.t()
                    }]
                }, {
                    xtype: 'toolbar',
                    dock: 'bottom',
                    padding: 5,
                    items: [{
                        xtype: 'component',
                        html: ' <i class="fa fa-level-down fa-rotate-180 fa-lg"></i> ' + 'Select the default columns to show in report'.t()
                    }],
                    hidden: true,
                    bind: {
                        hidden: '{eEntry.type !== "EVENT_LIST"}'
                    }
                }]
            }, {
                region: 'east',
                width: '70%',
                // title: '<i class="fa fa-columns"></i> ' + '<strong>' + 'Time Data Columns'.t() + '</strong>',
                split: true,
                layout: 'card',
                bind: {
                    activeItem: '{activeDataColumnsCard}',
                },
                items: [{
                    xtype: 'grid',
                    itemId: 'timeDataColumnsGrid',
                    sortableColumns: false,
                    enableColumnResize: false,
                    enableColumnMove: false,
                    enableColumnHide: false,
                    disableSelection: true,
                    border: false,
                    viewConfig: {
                        emptyText: '<p style="text-align: center; margin: 0; line-height: 2; font-size: 12px; color: red;"><i class="fa fa-exclamation-triangle fa-lg fa-orange"></i><br/>' + 'Time Data Columns are required for the graph!'.t() + '</p>',
                    },
                    tbar: [{
                        xtype: 'component',
                        html: 'Time Data Columns'.t()
                    }, '->', {
                        xtype: 'button',
                        text: 'Add'.t(),
                        iconCls: 'fa fa-plus-circle',
                        handler: function (btn) {
                            btn.up('grid').getStore().add({ str: '' });
                        }
                    }],
                    plugins: [{
                        ptype: 'cellediting',
                        clicksToEdit: 1
                    }],
                    bind: {
                        store: '{timeDataColumnsStore}',
                    },
                    columns: [{
                        dataIndex: 'str',
                        flex: 1,
                        editor: 'textfield',
                        renderer: function (val) {
                            return val ? '<strong>' + val + '</strong>' : '<em>Click to insert column value ...</em>';
                        }
                    }, {
                        xtype: 'actioncolumn',
                        width: 40,
                        align: 'center',
                        resizable: false,
                        tdCls: 'action-cell',
                        iconCls: 'fa fa-times',
                        handler: 'removeTimeDataColumn',
                        // handler: function (view, rowIndex, colIndex, item, e, record) {
                        //     record.drop();
                        //     record.commit();
                        // },
                        menuDisabled: true,
                        hideable: false
                    }]
                }, {
                    xtype: 'grid',
                    itemId: 'textDataColumnsGrid',
                    sortableColumns: false,
                    enableColumnResize: false,
                    enableColumnMove: false,
                    enableColumnHide: false,
                    disableSelection: true,
                    hideHeaders: true,
                    border: false,
                    viewConfig: {
                        emptyText: '<p style="text-align: center; margin: 0; line-height: 2; font-size: 12px; color: red;"><i class="fa fa-exclamation-triangle fa-lg fa-orange"></i><br/>' + 'Text Columns are required for the report!'.t() + '</p>',
                    },
                    tbar: [{
                        xtype: 'component',
                        html: 'Text Data Columns'.t()
                    }, '->', {
                        xtype: 'button',
                        text: 'Add'.t(),
                        iconCls: 'fa fa-plus-circle',
                        handler: function (btn) {
                            btn.up('grid').getStore().add({ str: '' });
                        }
                    }],
                    plugins: [{
                        ptype: 'cellediting',
                        clicksToEdit: 1
                    }],
                    disabled: false,
                    bind: {
                        store: '{textColumnsStore}',
                        hidden: '{eEntry.type !== "TEXT"}'
                    },
                    columns: [{
                        xtype: 'rownumberer',
                        // title: 'Value Mask'.t(),
                        width: 40,
                        renderer: function (value, metaData, record, rowIdx) { return '{' + rowIdx + '}'; }
                    }, {
                        dataIndex: 'str',
                        flex: 1,
                        editor: 'textfield',
                        renderer: function (val) {
                            return val ? '<strong>' + val + '</strong>' : '<em>Click to insert column value ...</em>';
                        }
                    }, {
                        xtype: 'actioncolumn',
                        width: 40,
                        align: 'center',
                        resizable: false,
                        tdCls: 'action-cell',
                        iconCls: 'fa fa-times',
                        // handler: function (view, rowIndex, colIndex, item, e, record) {
                        //     record.drop();
                        // },
                        handler: 'removeTextColumn',
                        menuDisabled: true,
                        hideable: false
                    }]
                }]
            }]
        }]
    }],

    buttons: [{
        xtype: 'component',
        hidden: true,
        bind: {
            hidden: '{!eEntry.readOnly}'
        },
        html: '<i class="fa fa-info-circle fa-lg"></i> ' + 'This is a default <strong>read-only</strong> report. Changes can be saved as a New Report.'
    }, '->', {
        text: 'Cancel'.t(),
        scale: 'medium',
        iconCls: 'fa fa-ban fa-lg',
        handler: 'cancel'
    }, {
        text: 'Preview/Refresh'.t(),
        iconCls: 'fa fa-refresh',
        scale: 'medium'
        // handler: 'resetAndReload',
        // formBind: true
    }, {
        iconCls: 'fa fa-trash fa-red fa-lg',
        text: 'Delete'.t(),
        handler: 'removeReport',
        hidden: true,
        bind: {
            hidden: '{eEntry.readOnly || !eEntry.uniqueId}'
        }
    }, {
        text: 'Update'.t(),
        iconCls: 'fa fa-floppy-o fa-lg',
        formBind: true,
        handler: 'updateReport',
        hidden: true,
        bind: {
            hidden: '{eEntry.readOnly || !eEntry.uniqueId}'
        }
    }, {
        text: 'Create New'.t(),
        scale: 'medium',
        iconCls: 'fa fa-floppy-o fa-lg',
        formBind: true,
        handler: 'saveNewReport'
    }]
});
