Ext.define('Ung.view.reports.EventReport', {
    extend: 'Ext.grid.Grid',
    alias: 'widget.eventreport',
    itemId: 'eventreport',
    cls: 'x-grid-events',
    // viewModel: {
    //     data: { eventsData: [], propsData: [] },
    //     stores: {
    //         events: {
    //             data: '{eventsData}',

    //         }
    //     }
    // },

    // bind: '{events}',
    emptyText: 'No Events!'.t(),

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
    rowNumbers: {
        width: 50,
        resizable: false
    },
    store: {
        type: 'events'
    },

    plugins: {
        gridviewoptions: true
    },

    listeners: {
        initialize: 'onInitialize',
        resize: 'onResize'
    },

    items: [{
        xtype: 'toolbar',
        docked: 'top',
        items: [{
            text: 'Columns'.t(),
            iconCls: 'x-fa fa-bars',
            itemId: 'columnsMenu',
            menu: {
                defaultType: 'menucheckitem',
                indented: false,
                mouseLeaveDelay: 0
            }
        }, '->', {
            xtype: 'searchfield',
            ui: 'solo',
            width: 300,
            placeholder: 'Filter data ...'.t(),
            listeners: {
                change: 'onFilterChange'
            }
        }]
    }],


    controller: {
        onInitialize: function (view) {
            var me = this, vm = me.getViewModel();
            vm.bind('{entry}', function (entry) {
                console.log('bind change');
                // vm.set('eventsData', []);
                view.getStore().loadData([]);
                view.setColumns([]);
                me.getView().down('#columnsMenu').getMenu().removeAll();
                if (!entry || entry.get('type') !== 'EVENT_LIST') { return; }
                me.setup(entry);
            });
            vm.bind('{eventsGroups.eventslimit}', function () {
                me.fetchData();
            });
        },

        onResize: function () {
            console.log('resize');
        },

        setup: function (entry) {
            var me = this, columns = [], defaultColumns = entry.get('defaultColumns');
            me.getView().setColumns([]);
            me.tableConfig = Ext.clone(TableConfig.getConfig(entry.get('table')));
            me.tc = TableConfig2.getColumns(entry.get('table'), defaultColumns);
            console.log(entry.get('table'));
            me.defaultColumns = entry.get('defaultColumns');

            var cm = me.getView().down('#columnsMenu').getMenu(), menuItems = [];
            cm.removeAll();
            // cm.add(me.tc);
            // columns.push({
            //     xtype: 'datecolumn',
            //     text: 'Time',
            //     dataIndex: 'time',
            //     format: 'Y:m:d H:i:s'
            // });

            // Ext.Array.each(me.tc.columns, function (column) {
            //     if (me.defaultColumns && !Ext.Array.contains(me.defaultColumns, column.dataIndex)) {
            //         column.hidden = true;
            //         // return;
            //     }
            //     columns.push(column);
            //     // menuItems.push({
            //     //     text: column.menuText,
            //     //     checked: !column.hidden,
            //     //     dataIndex: column.dataIndex
            //     // });
            //     // // TO REVISIT THIS BECASE OF STATEFUL
            //     // // grid.initComponentColumn(column);
            //     // if (column.rtype) {
            //     //     column.renderer = 'columnRenderer';
            //     // }
            // });
            cm.add(me.tc.menuItems);
            // columns.push({
            //     xtype: 'datecolumn',
            //     text: 'Date',
            //     groupable: true,
            //     dataIndex: 'date',
            //     format: 'Y-m-d h:00 a',
            //     hidden: true
            // });
            me.getView().setColumns(me.tc.columns);

            // me.getView().setColumnsMenuItem({
            //     xtype: 'menuitem',
            //     weight: -80,
            //     text: 'aaaa',
            //     menu: {
            //         defaultType: 'menucheckitem',
            //         indented: false,
            //         mouseLeaveDelay: 0,
            //         items: me.tc.menuItems
            //     }
            // });

            console.log('columns setup');
            me.fetchData();
        },

        fetchData: function () {
            var vm = this.getViewModel(), entry = vm.get('entry'), view = this.getView();
            if (!entry) { return; }
            view.mask();
            Rpc.asyncData('rpc.reportsManager.getEventsForDateRangeResultSet',
                entry.getData(), // entry
                null, // vm.get('globalConditions'), // etra conditions
                vm.get('eventsGroups.eventslimit'),
                null, // start date
                null) // end date
                .then(function(result) {
                    // console.log(result);
                    // me.getView().setLoading(false);
                    // if (reps) { reps.getViewModel().set('fetching', false); }
                    // me.loadResultSet(result);
                    // load result set
                    var nextChunk = true, dataChunk, events = [];
                    while (nextChunk) {
                        dataChunk = result.getNextChunk(500);
                        if (dataChunk && dataChunk.list && dataChunk.list.length) {
                            Ext.Array.push(events, dataChunk.list);
                        } else {
                            nextChunk = false;
                        }
                    }
                    result.closeConnection();
                    view.getStore().loadData(events);
                    // vm.set('eventsData', events);
                    view.unmask();
                });
        },

        onFilterChange: function (el, value, oldValue) {
            var me = this, grid = me.getView();
            var regex = Ext.String.createRegex(value, false, false, true);
            grid.getStore().clearFilter();
            grid.getStore().getFilters().add(function (item) {
                var str = [], filtered = false;
                Ext.Array.each(grid.getColumns(), function (col) {
                    var val = item.get(col.getDataIndex());
                    if (!val) { return; }
                    str.push(typeof val === 'object' ? Util.timestampFormat(val) : val.toString());
                });
                console.log(item);
                if (regex.test(str.join('|'))) {
                    filtered = true;
                }
                return filtered;
            });
        },

        showHideColumn: function (item, checked) {
            var me = this, grid = me.getView();
            var menu = grid.down('#columnsMenu').getMenu(), cols = [];

            // var columns = grid.getColumns();
            // Ext.Array.remove(columns, Ext.Array.findBy(columns, function (column) {
            //     return column.getDataIndex() === item.dataIndex;
            // }));
            // grid.setColumns(columns);
            Ext.Array.each(menu.getItems().items, function (smenu) {
                Ext.Array.each(smenu.getMenu().getItems().items, function (col) {
                    if (col.getChecked()) {
                        cols.push(col.dataIndex);
                    }
                });
            });
            var c = TableConfig2.getColumns(me.getViewModel().get('entry.table'), cols);
            grid.setColumns(c.columns);
            // grid.setColumnsMenuItem({
            //     xtype: 'menuitem',
            //     // lazy: true,
            //     weight: -80,
            //     text: 'aaaa',
            //     menu: {
            //         defaultType: 'menucheckitem',
            //         indented: false,
            //         mouseLeaveDelay: 0,
            //         items: c.menuItems
            //     }
            // });
            grid.refresh();
            // var columns = grid.getColumns();
            // if (checked) {
            //     Ext.Array.remove(columns, Ext.Array.findBy(columns, function (column) {
            //         return column.getDataIndex() === item.dataIndex;
            //     }));
            // }
            // console.log(columns);
            // grid.setColumns(columns);
        }
    }
});
