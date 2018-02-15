Ext.define('Ung.view.reports.EventReport', {
    extend: 'Ext.grid.Grid',
    alias: 'widget.eventreport',
    itemId: 'eventreport',
    cls: 'x-grid-events',
    bind: {
        title: '{entry.title}'
    },
    // viewModel: {
    //     data: { eventsData: [], propsData: [] },
    //     stores: {
    //         events: {
    //             data: '{eventsData}',

    //         }
    //     }
    // },

    // bind: '{events}',
    // columnMenu: null,
    userSelectable: {
        element: true,
        bodyElement: true
    },
    multiColumnSort: true,
    striped: true,
    grouped: true,
    store: {
        type: 'events'
    },

    plugins: {
        gridviewoptions: true
    },

    listeners: {
        initialize: 'onInitialize',
    },

    items: [{
        xtype: 'toolbar',
        docked: 'top',
        shadow: false,
        padding: 16,
        style: {
            // background: '#F5F5F5',
            fontSize: '14px',
            fontWeight: 400,
            zIndex: 10
        },
        bind: {
            html: '{entry.description}'
        }
    }, {
        xtype: 'toolbar',
        docked: 'top',
        items: [{
            xtype: 'searchfield',
            ui: 'faded',
            width: 300,
            placeholder: 'Filter data ...'.t(),
            listeners: {
                change: 'onFilterChange'
            }
        }, '->', {
            text: 'Columns'.t(),
            iconCls: 'x-fa fa-bars',
            itemId: 'columnsMenu',
            menu: {
                defaultType: 'menucheckitem',
                defaults: {
                    listeners: {
                        checkchange: 'showHideColumn'
                    }
                }
            }
        }]
    }],


    controller: {
        onInitialize: function () {
            var me = this, vm = me.getViewModel();
            vm.bind('{entry}', function (entry) {
                console.log('bind change');
                vm.set('eventsData', []);
                if (!entry || entry.get('type') !== 'EVENT_LIST') { return; }
                me.setup(entry);
            });

        },

        setup: function (entry) {
            var me = this, columns = [];
            me.getView().setColumns([]);
            me.tableConfig = Ext.clone(TableConfig.getConfig(entry.get('table')));
            me.tc = TableConfig2.getColumns(entry.get('table'));
            console.log(me.tc);
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

            Ext.Array.each(me.tc.columns, function (column) {
                if (me.defaultColumns && !Ext.Array.contains(me.defaultColumns, column.dataIndex)) {
                    column.hidden = true;
                    // return;
                }
                columns.push(column);
                // menuItems.push({
                //     text: column.menuText,
                //     checked: !column.hidden,
                //     dataIndex: column.dataIndex
                // });
                // // TO REVISIT THIS BECASE OF STATEFUL
                // // grid.initComponentColumn(column);
                // if (column.rtype) {
                //     column.renderer = 'columnRenderer';
                // }
            });
            cm.add(me.tc.menuItems);
            // columns.push({
            //     xtype: 'datecolumn',
            //     text: 'Date',
            //     groupable: true,
            //     dataIndex: 'date',
            //     format: 'Y-m-d h:00 a',
            //     hidden: true
            // });
            console.log(columns);
            me.getView().setColumns(columns);
            console.log('columns setup');
            me.fetchData();
        },

        fetchData: function () {
            var vm = this.getViewModel(), entry = vm.get('entry'), view = this.getView();
            view.mask();
            Rpc.asyncData('rpc.reportsManager.getEventsForDateRangeResultSet',
                entry.getData(), // entry
                null, // vm.get('globalConditions'), // etra conditions
                1000,
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

        onFilterChange: function (el, newValue, oldValue) {
            console.log(newValue);
        },

        showHideColumn: function (item, checked) {
            var me = this, grid = me.getView();
            Ext.Array.findBy(grid.getColumns(), function (column) {
                return column.getDataIndex() === item.dataIndex;
            }).setHidden(!checked);
        }
    }
});
