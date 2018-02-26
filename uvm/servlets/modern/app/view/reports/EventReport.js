Ext.define('Ung.view.reports.EventReport', {
    extend: 'Ext.grid.Grid',
    alias: 'widget.eventreport',
    reference: 'eventreport',
    itemId: 'eventreport',
    cls: 'x-grid-events',

    viewModel: true,
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
    rowLines: false,
    rowNumbers: {
        text: '#',
        width: 60,
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
        resize: 'onResize',
        select: function (el, rec) {
            console.log(rec);
        }
    },

    items: {
        xtype: 'selectiondetails',
        docked: 'right',
        width: 350,
        hidden: true,
        // title: 'Session details'.t(),
        collapsible: false,
        bind: {
            // title: '{eventreport.selection.session_id}',
            hidden: '{!eventreport.selection}',
        }
    },

    // items: [{
    //     xtype: 'toolbar',
    //     docked: 'top',
    //     items: ['->', {
    //         xtype: 'searchfield',
    //         ui: 'solo',
    //         width: 300,
    //         placeholder: 'Filter data ...'.t(),
    //         listeners: {
    //             change: 'onFilterChange'
    //         }
    //     }]
    // }],


    controller: {
        onInitialize: function (view) {
            var me = this, vm = me.getViewModel();
            vm.bind('{entry}', function (entry) {
                // vm.set('eventsData', []);
                view.getStore().loadData([]);
                view.setColumns([]);
                // me.getView().down('#columnsMenu').getMenu().removeAll();
                if (!entry || entry.get('type') !== 'EVENT_LIST') { return; }
                me.setup(entry);
            });
            vm.bind('{eventsGroups.eventslimit}', function () {
                me.fetchData();
            });
        },

        onResize: function () {
            // console.log('resize');
        },

        setup: function (entry) {
            var me = this, columns = [], defaultColumns = entry.get('defaultColumns');
            me.getView().setColumns([]);
            me.tableConfig = Ext.clone(TableConfig.getConfig(entry.get('table')));
            me.tc = TableConfig2.getColumns(entry.get('table'), defaultColumns);
            me.defaultColumns = entry.get('defaultColumns');

            var cm = me.getView().up('ung-reports').down('#columnsMenu').getMenu(), menuItems = [];
            me.getView().setColumns(me.tc.columns);

            me.fetchData();
        },

        fetchData: function () {
            var vm = this.getViewModel(), entry = vm.get('entry'), view = this.getView();
            if (!entry) { return; }

            var startDate = new Date();
            startDate = Ext.Date.subtract(new Date(), Ext.Date.HOUR, vm.get('menuGroups.since'));
            var endDate = null;
            view.mask();
            Rpc.asyncData('rpc.reportsManager.getEventsForDateRangeResultSet',
                entry.getData(), // entry
                null, // vm.get('globalConditions'), // etra conditions
                vm.get('eventsGroups.eventslimit'),
                Util.clientToServerDate(startDate),
                endDate) // end date
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
        }
    }
});
