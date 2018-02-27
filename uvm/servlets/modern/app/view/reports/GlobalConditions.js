Ext.define('Ung.view.reports.GlobalConditions', {
    extend: 'Ext.grid.Grid',
    alias: 'widget.globalconditions',
    // itemId: 'eventreport',
    // cls: 'x-grid-events',

    title: '<span class="x-icon-el x-fa fa-filter"></span> ' + 'Global Conditions'.t(),

    viewModel: true,
    config: {
        tableComboStore: null
    },

    // bind: '{events}',
    emptyText: 'No Conditions!'.t(),

    items: [{
        xtype: 'toolbar',
        docked: 'top',
        items: [{
            xtype: 'button',
            text: 'Add'.t(),
            handler: 'addCondition'
        }]
    }, {
        xtype: 'toolbar',
        docked: 'bottom',
        defaults: {
            margin: '0 0 0 20'
        },
        items: ['->', {
            text: 'Cancel'.t(),
            iconCls: 'x-fa fa-ban'
        }, {
            text: 'Apply'.t(),
            ui: 'action',
            iconCls: 'x-fa fa-check'
        }]
    }],

    userSelectable: {
        element: true,
        bodyElement: true
    },
    // multiColumnSort: true,
    striped: true,
    columnsMenuItem: {
        hidden: true
    },
    // grouped: true,
    // rowLines: false,
    rowNumbers: {
        text: '#',
        width: 40,
        resizable: false
    },
    store: {
        data: [],
        fields: [{
            name: 'column'
        }]
    },

    // plugins: {
    //     grideditable: true
    // },

    columns: [{
        text: 'Column'.t(),
        dataIndex: 'column',
        width: 500,
        menuDisabled: true,
        cell: {
            xtype: 'widgetcell',
            widget: {
                xtype: 'combobox',
                margin: '0 10',
                queryMode: 'local',
                displayField: 'display',
                valueField: 'value',
                editable: false,
                // displayTpl: '{display} ({value})',
                itemTpl: '<div data-qtip="{value}">{display}</div>',
                bind: {
                    store: '{tableComboStore}',
                    value: '{record.column}'
                }
            }
        }
    }, {
        text: 'Operator'.t(),
        dataIndex: 'operator',
        width: 250,
        menuDisabled: true,
        cell: {
            xtype: 'widgetcell',
            widget: {
                xtype: 'combobox',
                margin: '0 10',
                bind: {
                    value: '{record.operator}'
                },
                queryMode: 'local',
                displayField: 'display',
                valueField: 'value',
                editable: false,
                store: [
                    { value: '=', display: 'equals (=)' },
                    { value: '!=', display: 'not equals (!=)' },
                    { value: '<', display: 'less than (<)' },
                    { value: '>', display: 'greater than (>)' },
                    { value: '>=', display: 'greater than or equal (>=)' },
                    { value: '<=', display: 'less than or equal (<=)' },
                    { value: 'like', display: 'like' },
                    { value: 'not like', display: 'not like' },
                    { value: 'is', display: 'is' },
                    { value: 'is not', display: 'is not' },
                    { value: 'in', display: 'not in' }
                ]
            }
        }
    }, {
        text: 'Value'.t(),
        dataIndex: 'value',
        flex: 1,
        menuDisabled: true,
        cell: {
            xtype: 'widgetcell',
            widget: {
                margin: '0 10',
                xtype: 'textfield',
                bind: '{record.value}'
            }
        }
    }, {
        xtype: 'checkcolumn',
        text: 'Auto Format'.t(),
        dataIndex: 'autoFormatValue',
        headerCheckbox: false,
        menuDisabled: true
    }, {
        width: 40,
        resizable: false,
        cell: {
            tools: {
                minus: {
                    iconCls: 'x-fa fa-trash'
                }
            }
        }
    }],

    controller: {
        onInitialize: function (view) {
            var vm = view.getViewModel();
        },

        addCondition: function () {
            var grid = this.getView();
            console.log(grid.getViewModel());
            grid.getStore().add({
                column: 'hostname',
                operator: '=',
                value: 'aaaa',
                autoFormatValue: true
            });
        }
    }
});
