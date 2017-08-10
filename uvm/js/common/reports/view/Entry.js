Ext.define('Ung.view.reports.Entry', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.reports-entry',

    controller: 'reports-entry',

    viewModel: {
        type: 'reports-entry'
    },

    layout: 'border',

    items: [{
        region: 'center',
        border: false,
        bodyBorder: false,
        itemId: 'entryContainer',
        layout: 'card',
        bind: {
            activeItem: '{_reportCard}'
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
        }],

        dockedItems: [{
            xtype: 'toolbar',
            border: false,
            dock: 'top',
            cls: 'report-header',
            height: 53,
            padding: '0 10',
            items: [{
                xtype: 'component',
                bind: {
                    html: '{reportHeading}'
                }
            }, '->', {
                text: 'Current Data'.t(),
                reference: 'dataBtn',
                enableToggle: true,
                toggleGroup: 'side',
                iconCls: 'fa fa-list',
                hidden: true,
                bind: {
                    hidden: '{!entry || entry.type === "EVENT_LIST"}'
                }
            }, {
                itemId: 'exportBtn',
                text: 'Export'.t(),
                iconCls: 'fa fa-external-link-square',
                handler: 'exportEventsHandler',
                hidden: true,
                bind: {
                    hidden: '{entry.type !== "EVENT_LIST"}'
                }
            }, {
                text: 'Settings'.t(),
                reference: 'settingsBtn',
                enableToggle: true,
                toggleGroup: 'side',
                iconCls: 'fa fa-cog',
                hidden: true,
                bind: {
                    hidden: '{!entry}'
                }
            }]
        }, {
            xtype: 'toolbar',
            dock: 'top',
            border: false,
            hidden: true,
            bind: {
                hidden: '{!entry || entry.type !== "EVENT_LIST"}'
            },
            items: [{
                xtype: 'ungridfilter'
            },{
                xtype: 'ungridstatus'
            }]
        }, {
            xtype: 'toolbar',
            itemId: 'actionsToolbar',
            ui: 'footer',
            dock: 'bottom',
            // border: true,
            style: {
                background: '#F5F5F5'
            },
            hidden: true,
            bind: {
                hidden: '{!entry}'
            },
            items: [{
                xtype: 'combo',
                itemId: 'eventsLimitSelector',
                hidden: true,
                disabled: true,
                bind: {
                    hidden: '{entry.type !== "EVENT_LIST"}',
                    disabled: '{fetching}'
                },
                editable: false,
                value: 1000,
                store: [
                    [1000, '1000 ' + 'Events'.t()],
                    [10000, '10000 ' + 'Events'.t()],
                    [50000, '50000 ' + 'Events'.t()]
                ],
                queryMode: 'local',
                listeners: {
                    change: 'refreshData'
                }
            }, {
                xtype: 'label',
                margin: '0 5',
                text: 'From'.t() + ':'
            }, {
                xtype: 'datefield',
                format: 'date_fmt'.t(),
                editable: false,
                width: 100,
                disabled: true,
                bind: {
                    value: '{_sd}',
                    maxValue: '{_ed}',
                    disabled: '{fetching}'
                }
            }, {
                xtype: 'timefield',
                increment: 10,
                // format: 'date_fmt'.t(),
                editable: false,
                width: 80,
                disabled: true,
                bind: {
                    value: '{_st}',
                    // maxValue: '{_ed}'
                    disabled: '{fetching}'
                }
            }, {
                xtype: 'label',
                margin: '0 5',
                text: 'till'
            }, {
                xtype: 'checkbox',
                boxLabel: 'Present'.t(),
                disabled: true,
                bind: {
                    value: '{tillNow}',
                    disabled: '{fetching}'
                }
            }, {
                xtype: 'datefield',
                format: 'date_fmt'.t(),
                editable: false,
                width: 100,
                hidden: true,
                disabled: true,
                bind: {
                    value: '{_ed}',
                    hidden: '{tillNow}',
                    minValue: '{_sd}',
                    disabled: '{fetching}'
                },
                maxValue: new Date(Math.floor(rpc.systemManager.getMilliseconds()))
            }, {
                xtype: 'timefield',
                increment: 10,
                // format: 'date_fmt'.t(),
                editable: false,
                width: 80,
                hidden: true,
                disabled: true,
                bind: {
                    value: '{_et}',
                    hidden: '{tillNow}',
                    // minValue: '{_sd}'
                    disabled: '{fetching}'
                },
                // maxValue: new Date(Math.floor(rpc.systemManager.getMilliseconds()))
            }, '->', {
                xtype: 'component',
                html: '<i class="fa fa-spinner fa-spin fa-fw fa-lg"></i>',
                hidden: true,
                bind: {
                    hidden: '{!fetching}'
                }
            }, {
                xtype: 'checkbox',
                boxLabel: 'Auto Refresh'.t(),
                disabled: true,
                bind: {
                    value: '{autoRefresh}',
                    disabled: '{!autoRefresh && fetching}'
                },
                handler: 'setAutoRefresh'
            }, {
                text: 'Refresh'.t(),
                iconCls: 'fa fa-refresh',
                itemId: 'refreshBtn',
                handler: 'refreshData',
                bind: {
                    disabled: '{autoRefresh || fetching}'
                }
            }, {
                text: 'Reset View'.t(),
                iconCls: 'fa fa-refresh',
                itemId: 'resetBtn',
                handler: 'resetView',
                disabled: true,
                bind: {
                    hidden: '{entry.type !== "EVENT_LIST"}',
                    disabled: '{fetching}'
                }
            }, {
                itemId: 'downloadBtn',
                text: 'Download'.t(),
                iconCls: 'fa fa-download',
                handler: 'downloadGraph',
                hidden: true,
                disabled: true,
                bind: {
                    hidden: '{!isGraphEntry}',
                    disabled: '{fetching}'
                }
            }, '-', {
                itemId: 'dashboardBtn',
                hidden: true,
                disabled: true,
                bind: {
                    iconCls: 'fa {widget ? "fa-minus-circle" : "fa-plus-circle" }',
                    text: '{widget ? "Remove from " : "Add to "}' + ' Dashboard',
                    hidden: '{context !== "admin"}',
                    disabled: '{fetching}'
                },
                handler: 'dashboardAddRemove'
            }]
        }],
    }, {
        region: 'east',
        // xtype: 'tabpanel',
        // title: 'Data & Settings'.t(),
        width: 400,
        minWidth: 400,
        split: true,
        // animCollapse: false,
        // floatable: true,
        // floating: true,
        // collapsible: true,
        // collapsed: false,
        // titleCollapse: true,
        // hidden: true,
        border: false,
        bind: {
            hidden: '{!(dataBtn.pressed || settingsBtn.pressed)}',
            activeItem: '{dataBtn.pressed ? 0 : 1}'
        },

        layout: 'card',

        defaults: {
            border: false
        },

        items: [{
            xtype: 'grid',
            itemId: 'currentData',
            // title: '<i class="fa fa-list"></i> ' + 'Current Data'.t(),
            // hidden: true,
            // emptyText: '<p style="text-align: center; margin: 0; line-height: 2;"><i class="fa fa-info-circle fa-2x"></i> <br/>No Data!</p>',
            store: { data: [] },
            // bind: {
            //     store: {
            //         data: '{_currentData}'
            //     },
            //     // hidden: '{entry && entry.type === "EVENT_LIST"}'
            // },
            dockedItems: [{
                xtype: 'toolbar',
                border: false,
                dock: 'top',
                cls: 'report-header',
                height: 53,
                padding: '0 10',
                items: [{
                    xtype: 'component',
                    html: '<h2>' + 'Current Data'.t() + '</h2><p>&nbsp;</p>'
                }, '->', {
                    iconCls: 'fa fa-external-link-square',
                    text: 'Export'.t(),
                    handler: 'exportGraphData'
                }, {
                    iconCls: 'fa fa-close',
                    handler: 'closeSide'
                }]
            }],
        }, {
            xtype: 'form',
            // title: '<i class="fa fa-cog"></i> ' + 'Settings'.t(),
            scrollable: 'y',
            layout: 'anchor',
            bodyBorder: false,
            bodyPadding: 10,

            dockedItems: [{
                xtype: 'toolbar',
                border: false,
                dock: 'top',
                cls: 'report-header',
                height: 53,
                padding: '0 10',
                items: [{
                    xtype: 'component',
                    html: '<h2>' + 'Settings'.t() + '</h2><p>&nbsp;</p>'
                }, '->', {
                    iconCls: 'fa fa-close',
                    handler: 'closeSide'
                }]
            }],

            items: [{
                xtype: 'component',
                padding: 10,
                margin: '0 0 10 0',
                style: { background: '#EEE' },
                hidden: true,
                bind: {
                    hidden: '{!entry.readOnly}',
                    html: '{reportMessages}'
                }
            }, {
                xtype: 'textfield',
                fieldLabel: '<strong>' + 'Title'.t() + '</strong>',
                labelAlign: 'right',
                bind: '{entry.title}',
                anchor: '100%',
                listeners: {
                    change: 'titleChange'
                }
            }, {
                xtype: 'textarea',
                grow: true,
                fieldLabel: '<strong>' + 'Description'.t() + '</strong>',
                labelAlign: 'right',
                bind: '{entry.description}',
                anchor: '100%'
            }, {
                xtype: 'fieldset',
                title: '<i class="fa fa-paint-brush"></i> ' + 'Style'.t(),
                padding: 10,
                collapsible: true,
                defaults: {
                    labelWidth: 150,
                    labelAlign: 'right'
                },
                hidden: true,
                bind: {
                    hidden: '{!isGraphEntry}'
                },
                items: [{
                    // TIME_GRAPH - chart style
                    xtype: 'combo',
                    fieldLabel: 'Time Chart Style'.t(),
                    anchor: '100%',
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
                    hidden: true,
                    bind: {
                        value: '{entry.timeStyle}',
                        hidden: '{!(isTimeGraph || isTimeGraphDynamic)}'
                    },
                }, {
                    // TIME_GRAPH - data interval
                    xtype: 'combo',
                    fieldLabel: 'Time Data Interval'.t(),
                    anchor: '100%',
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
                    hidden: true,
                    bind: {
                        value: '{entry.timeDataInterval}',
                        hidden: '{!(isTimeGraph || isTimeGraphDynamic)}'
                    },
                }, {
                    // TIME_GRAPH - data grouping approximation
                    xtype: 'combo',
                    fieldLabel: 'Approximation'.t(),
                    anchor: '100%',
                    editable: false,
                    store: [
                        ['average', 'Average'.t()],
                        ['high', 'High'.t()],
                        ['low', 'Low'.t()],
                        ['sum', 'Sum'.t() + ' (' + 'default'.t() + ')'] // default
                    ],
                    queryMode: 'local',
                    hidden: true,
                    bind: {
                        value: '{_approximation}',
                        hidden: '{!(isTimeGraph || isTimeGraphDynamic)}'
                    },
                }, {
                    // PIE_GRAPH - chart style
                    xtype: 'combo',
                    fieldLabel: 'Style'.t(),
                    anchor: '100%',
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
                    hidden: true,
                    bind: {
                        value: '{entry.pieStyle}',
                        disabled: '{!isPieGraph}',
                        hidden: '{!isPieGraph}'
                    },
                }, {
                    // PIE_GRAPH - number of pie slices
                    xtype: 'numberfield',
                    fieldLabel: 'Pie Slices Number'.t(),
                    labelWidth: 150,
                    width: 210,
                    labelAlign: 'right',
                    minValue: 1,
                    maxValue: 25,
                    allowBlank: false,
                    hidden: true,
                    bind: {
                        value: '{entry.pieNumSlices}',
                        disabled: '{!isPieGraph}',
                        hidden: '{!isPieGraph}'
                    }
                }, {
                    xtype: 'textarea',
                    anchor: '100%',
                    fieldLabel: 'Colors'.t() + ' (comma sep.)',
                    bind: '{_colorsStr}'
                }]
                // {
                //     xtype: 'checkbox',
                //     reference: 'defaultColors',
                //     fieldLabel: 'Colors'.t(),
                //     boxLabel: 'Default'.t(),
                //     bind: '{_defaultColors}'
                // }, {
                //     xtype: 'container',
                //     margin: '0 0 0 155',
                //     itemId: 'colors',
                //     hidden: true,
                //     bind: {
                //         hidden: '{defaultColors.checked}'
                //     }
                // }]
            }, {
                xtype: 'fieldset',
                title: '<i class="fa fa-sliders"></i> ' + 'Advanced'.t(),
                padding: 10,
                collapsible: true,
                collapsed: true,
                defaults: {
                    labelWidth: 150,
                    labelAlign: 'right'
                },
                items: [{
                    // ALL graphs
                    xtype: 'textfield',
                    fieldLabel: 'Units'.t(),
                    anchor: '100%',
                    hidden: true,
                    bind: {
                        value: '{entry.units}',
                        hidden: '{!isGraphEntry}'
                    }
                }, {
                    // ALL entries
                    xtype: 'combo',
                    fieldLabel: 'Table'.t(),
                    anchor: '100%',
                    bind: {
                        value: '{entry.table}',
                        store: '{tables}'
                    },
                    editable: false,
                    queryMode: 'local'
                }, {
                    // TIME_GRAPH only
                    xtype: 'grid',
                    itemId: 'timeDataColumnsGrid',
                    sortableColumns: false,
                    enableColumnResize: false,
                    enableColumnMove: false,
                    enableColumnHide: false,
                    disableSelection: true,
                    margin: '0 0 5 0',
                    tbar: [{
                        xtype: 'component',
                        html: 'Time Data Columns'.t(),
                        padding: '0 0 0 5'
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
                        hidden: '{!isTimeGraph}'
                    },
                    columns: [{
                        dataIndex: 'str',
                        flex: 1,
                        editor: 'textfield',
                        renderer: function (val) {
                            return val || '<em>Click to insert column value ...</em>';
                        }
                    }, {
                        xtype: 'actioncolumn',
                        width: 40,
                        align: 'center',
                        resizable: false,
                        tdCls: 'action-cell',
                        iconCls: 'fa fa-times',
                        handler: function (view, rowIndex, colIndex, item, e, record) {
                            record.drop();
                        },
                        menuDisabled: true,
                        hideable: false
                    }]
                }, {
                    xtype: 'component',
                    style: {
                        borderTop: '1px #CCC solid',
                        margin: '15px 0'
                    },
                    autoEl: { tag: 'hr' },
                    hidden: true,
                    bind: { hidden: '{!isTimeGraphDynamic}' }
                }, {
                    // TIME_GRAPH_DYNAMIC only
                    xtype: 'textfield',
                    anchor: '100%',
                    fieldLabel: 'Time Data Dynamic Value'.t(),
                    labelWidth: 200,
                    hidden: true,
                    bind: {
                        value: '{entry.timeDataDynamicValue}',
                        hidden: '{!isTimeGraphDynamic}'
                    }
                }, {
                    // TIME_GRAPH_DYNAMIC only
                    xtype: 'textfield',
                    anchor: '100%',
                    fieldLabel: 'Time Data Dynamic Column'.t(),
                    labelWidth: 200,
                    hidden: true,
                    bind: {
                        value: '{entry.timeDataDynamicColumn}',
                        hidden: '{!isTimeGraphDynamic}'
                    }
                }, {
                    // TIME_GRAPH_DYNAMIC only
                    xtype: 'numberfield',
                    anchor: '100%',
                    fieldLabel: 'Time Data Dynamic Limit'.t(),
                    labelWidth: 200,
                    hidden: true,
                    bind: {
                        value: '{entry.timeDataDynamicLimit}',
                        hidden: '{!isTimeGraphDynamic}'
                    }
                }, {
                    // TIME_GRAPH_DYNAMIC only
                    xtype: 'combo',
                    anchor: '100%',
                    fieldLabel: 'Time Data Aggregation Function'.t(),
                    labelWidth: 200,
                    store: [
                        ['avg', 'Average'.t()],
                        ['sum', 'Sum'.t()],
                        ['min', 'Min'.t()],
                        ['max', 'Max'.t()]
                    ],
                    editable: false,
                    queryMode: 'local',
                    hidden: true,
                    bind: {
                        value: '{entry.timeDataDynamicAggregationFunction}',
                        hidden: '{!isTimeGraphDynamic}'
                    }
                }, {
                    // TIME_GRAPH_DYNAMIC only
                    xtype: 'checkbox',
                    fieldLabel: 'Time Data Dynamic Allow Null'.t(),
                    labelWidth: 200,
                    hidden: true,
                    bind: {
                        value: '{entry.timeDataDynamicAllowNull}',
                        hidden: '{!isTimeGraphDynamic}'
                    }
                }, {
                    xtype: 'component',
                    style: {
                        borderTop: '1px #CCC solid',
                        margin: '15px 0'
                    },
                    autoEl: { tag: 'hr' },
                    hidden: true,
                    bind: { hidden: '{!isTimeGraphDynamic}' }
                }, {
                    // GRAPH ENTRY
                    xtype: 'textfield',
                    anchor: '100%',
                    fieldLabel: 'Series Renderer'.t(),
                    hidden: true,
                    bind: {
                        value: '{entry.seriesRenderer}',
                        hidden: '{!isGraphEntry}'
                    }
                }, {
                    // PIE_GRAPH only
                    xtype: 'textfield',
                    anchor: '100%',
                    fieldLabel: 'Pie Group Column'.t(),
                    hidden: true,
                    bind: {
                        value: '{entry.pieGroupColumn}',
                        hidden: '{!isPieGraph}'
                    }
                }, {
                    // PIE_GRAPH only
                    xtype: 'textfield',
                    anchor: '100%',
                    fieldLabel: 'Pie Sum Column'.t(),
                    hidden: true,
                    bind: {
                        value: '{entry.pieSumColumn}',
                        hidden: '{!isPieGraph}'
                    }
                }, {
                    // ALL graphs
                    xtype: 'textfield',
                    anchor: '100%',
                    fieldLabel: 'Order By Column'.t(),
                    hidden: true,
                    bind: {
                        value: '{entry.orderByColumn}',
                        hidden: '{!isGraphEntry}'
                    }
                }, {
                    // ALL graphs
                    xtype: 'segmentedbutton',
                    margin: '0 0 5 155',
                    items: [
                        { text: 'Ascending'.t(), iconCls: 'fa fa-sort-amount-asc', value: true },
                        { text: 'Descending'.t(), iconCls: 'fa fa-sort-amount-desc' , value: false }
                    ],
                    hidden: true,
                    bind: {
                        value: '{entry.orderDesc}',
                        hidden: '{!isGraphEntry}'
                    }
                }, {
                    // TEXT only
                    xtype: 'grid',
                    itemId: 'textDataColumnsGrid',
                    sortableColumns: false,
                    enableColumnResize: false,
                    enableColumnMove: false,
                    enableColumnHide: false,
                    disableSelection: true,
                    margin: '0 0 5 0',
                    tbar: [{
                        xtype: 'component',
                        html: 'Text Columns'.t(),
                        padding: '0 0 0 5'
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
                        store: '{textDataColumnsStore}',
                        hidden: '{!isTextEntry}'
                    },
                    columns: [{
                        dataIndex: 'str',
                        flex: 1,
                        editor: 'textfield',
                        renderer: function (val) {
                            return val || '<em>Click to insert column value ...</em>';
                        }
                    }, {
                        xtype: 'actioncolumn',
                        width: 40,
                        align: 'center',
                        resizable: false,
                        tdCls: 'action-cell',
                        iconCls: 'fa fa-times',
                        handler: function (view, rowIndex, colIndex, item, e, record) {
                            record.drop();
                        },
                        menuDisabled: true,
                        hideable: false
                    }]
                }, {
                    // TEXT entries
                    xtype: 'textfield',
                    anchor: '100%',
                    fieldLabel: 'Text String'.t(),
                    hidden: true,
                    bind: {
                        value: '{entry.textString}',
                        hidden: '{!isTextEntry}'
                    }
                }, {
                    // ALL entries - display order
                    xtype: 'numberfield',
                    fieldLabel: 'Display Order'.t(),
                    anchor: '70%',
                    bind: '{entry.displayOrder}'
                }]
            }, {
                // columns for EVENT_LIST
                xtype: 'fieldset',
                title: '<i class="fa fa-columns"></i> ' + 'Columns'.t(),
                maxHeight: 200,
                scrollable: 'y',
                collapsible: true,
                items: [{
                    xtype: 'checkboxgroup',
                    itemId: 'tableColumns',
                    columns: 1,
                    vertical: true,
                    items: [],
                    listeners: {
                        change: 'updateDefaultColumns'
                    }
                }],
                hidden: true,
                bind: {
                    hidden: '{entry.type !== "EVENT_LIST"}'
                }
            }, {
                // SQL CONDITIONS
                xtype: 'fieldset',
                bind: {
                    title: '{_sqlTitle}',
                    collapsed: '{!entry.conditions}'
                },
                padding: 10,
                collapsible: true,
                collapsed: true,
                items: [{
                    xtype: 'grid',
                    itemId: 'sqlConditions',
                    sortableColumns: false,
                    enableColumnResize: false,
                    enableColumnMove: false,
                    enableColumnHide: false,
                    // hideHeaders: true,
                    disableSelection: true,
                    viewConfig: {
                        emptyText: '<p style="text-align: center; margin: 0; line-height: 2;"><i class="fa fa-info-circle fa-lg"></i> ' + 'No Conditions'.t() + '</p>',
                        stripeRows: false,
                    },
                    fields: ['column', 'operator', 'value'],
                    bind: {
                        store: {
                            data: '{_sqlConditions}'
                        }
                    },
                    dockedItems: [{
                        xtype: 'toolbar',
                        dock: 'top',
                        layout: {
                            type: 'hbox',
                            align: 'stretch'
                        },
                        items: [{
                            xtype: 'combo',
                            emptyText: 'Select Column ...',
                            flex: 1,
                            itemId: 'sqlConditionsCombo',
                            reference: 'sqlConditionsCombo',
                            publishes: 'value',
                            value: '',
                            editable: false,
                            queryMode: 'local',
                            displayField: 'text',
                            valueField: 'value',
                            store: { data: [] },
                            listConfig: {
                                itemTpl: ['<div data-qtip="{value}"><strong>{text}</strong> <span style="float: right;">[{value}]</span></div>']
                            },
                        }, {
                            xtype: 'button',
                            text: 'Add',
                            iconCls: 'fa fa-plus-circle',
                            disabled: true,
                            bind: {
                                disabled: '{!sqlConditionsCombo.value}'
                            },
                            handler: 'addSqlCondition'
                        }]
                    }],
                    columns: [{
                        header: 'Column'.t(),
                        dataIndex: 'column',
                        renderer: 'sqlColumnRenderer'
                    }, {
                        header: 'Operator'.t(),
                        xtype: 'widgetcolumn',
                        width: 82,
                        align: 'center',
                        widget: {
                            xtype: 'combo',
                            width: 80,
                            bind: '{record.operator}',
                            store: ['=', '!=', '>', '<', '>=', '<=', 'like', 'not like', 'is', 'is not', 'in', 'not in'],
                            editable: false,
                            queryMode: 'local'
                        }

                    }, {
                        header: 'Value'.t(),
                        xtype: 'widgetcolumn',
                        flex: 1,
                        widget: {
                            xtype: 'textfield',
                            bind: '{record.value}'
                        }
                    }, {
                        xtype: 'actioncolumn',
                        width: 22,
                        align: 'center',
                        iconCls: 'fa fa-minus-circle',
                        handler: 'removeSqlCondition'
                        // xtype: 'widgetcolumn',
                        // width: 22,
                        // align: 'center',
                        // widget: {
                        //     xtype: 'button',
                        //     width: 20,
                        //     iconCls: 'fa fa-minus-circle',
                        //     handler: 'removeSqlCondition'
                        // }
                    }]
                }]
            }],
            bbar: [
            '->',
            {
                text: 'Delete'.t(),
                iconCls: 'fa fa-minus-circle',
                disabled: true,
                bind: {
                    disabled: '{entry.readOnly}'
                },
                handler: 'removeReport'
            }, {
                text: 'Save'.t(),
                iconCls: 'fa fa-save',
                disabled: true,
                bind: {
                    disabled: '{disableSave}'
                },
                handler: 'updateReport'
            }, {
                text: 'Save as New Report'.t(),
                iconCls: 'fa fa-plus-circle',
                handler: 'saveNewReport',
                bind: {
                    disabled: '{disableNewSave}'
                }
            }]
        }]
    }, {
        region: 'south',
        xtype: 'grid',
        height: 280,
        title: Ext.String.format('Conditions: {0}'.t(), 0),
        itemId: 'sqlFilters',
        collapsible: true,
        collapsed: true,
        animCollapse: false,
        titleCollapse: true,
        split: true,
        hidden: true,

        sortableColumns: false,
        enableColumnResize: false,
        enableColumnMove: false,
        enableColumnHide: false,
        disableSelection: true,
        // hideHeaders: true,
        bind: {
            hidden: '{!entry}',
            store: { data: '{sqlFilterData}' }
        },

        viewConfig: {
            emptyText: '<p style="text-align: center; margin: 0; line-height: 2;"><i class="fa fa-info-circle fa-lg"></i> ' + 'No Conditions'.t() + '</p>',
            stripeRows: false,
        },

        dockedItems: [{
            xtype: 'toolbar',
            itemId: 'filtersToolbar',
            dock: 'top',
            layout: {
                type: 'hbox',
                align: 'stretch',
                pack: 'start'
            },
            items: [{
                xtype: 'button',
                text: 'Quick Add'.t(),
                iconCls: 'fa fa-plus-circle',
                menu: {
                    plain: true,
                    // mouseLeaveDelay: 0,
                    items: [{
                        text: 'Loading ...'
                    }],
                },
                listeners: {
                    menushow: 'sqlFilterQuickItems'
                }
            }, '-',  {
                xtype: 'combo',
                emptyText: 'Select Column ...',
                labelWidth: 100,
                labelAlign: 'right',
                width: 450,
                itemId: 'sqlFilterCombo',
                reference: 'sqlFilterCombo',
                publishes: 'value',
                value: '',
                editable: false,
                queryMode: 'local',
                displayField: 'text',
                valueField: 'value',
                store: { data: [] },
                listConfig: {
                    itemTpl: ['<div data-qtip="{value}"><strong>{text}</strong> <span style="float: right;">[{value}]</span></div>']
                },
                listeners: {
                    change: 'onColumnChange'
                }
            }, {
                xtype: 'combo',
                width: 80,
                publishes: 'value',
                value: '=',
                itemId: 'sqlFilterOperator',
                store: ['=', '!=', '>', '<', '>=', '<=', 'like', 'not like', 'is', 'is not', 'in', 'not in'],
                editable: false,
                queryMode: 'local',
                hidden: true,
                bind: {
                    hidden: '{!sqlFilterCombo.value}'
                }
            },
            // {
            //     xtype: 'textfield',
            //     itemId: 'sqlFilterValue',
            //     value: '',
            //     disabled: true,
            //     enableKeyEvents: true,
            //     bind: {
            //         disabled: '{sqlFilterCombo.value === ""}'
            //     },
            //     listeners: {
            //         keyup: 'onFilterKeyup'
            //     }
            // },
            {
                xtype: 'button',
                text: 'Add',
                iconCls: 'fa fa-plus-circle',
                disabled: true,
                bind: {
                    disabled: '{!sqlFilterCombo.value}'
                },
                handler: 'addSqlFilter'
            }]
        }],

        columns: [{
            header: 'Column'.t(),
            width: 435,
            dataIndex: 'column',
            renderer: 'sqlColumnRenderer'
        }, {
            header: 'Operator'.t(),
            xtype: 'widgetcolumn',
            width: 82,
            align: 'center',
            widget: {
                xtype: 'combo',
                width: 80,
                bind: '{record.operator}',
                store: ['=', '!=', '>', '<', '>=', '<=', 'like', 'not like', 'is', 'is not', 'in', 'not in'],
                editable: false,
                queryMode: 'local'
            }

        }, {
            header: 'Value'.t(),
            xtype: 'widgetcolumn',
            width: 300,
            widget: {
                xtype: 'textfield',
                bind: '{record.value}'
            }
        }, {
            xtype: 'actioncolumn',
            width: 30,
            flex: 1,
            // align: 'center',
            iconCls: 'fa fa-minus-circle',
            handler: 'removeSqlFilter'
        }]
    }]

});
