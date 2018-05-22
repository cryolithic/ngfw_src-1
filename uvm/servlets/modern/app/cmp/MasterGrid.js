Ext.define('Ung.cmp.MasterGrid', {
    extend: 'Ext.grid.Grid',
    alias: 'widget.mastergrid',

    layout: 'fit',

    listeners: {
        initialize: 'onInitialize',
        painted: 'onPainted'
        // navigate: function (el, to, from) { }
    },

    plugins: {
        gridcellediting: true,
        // grideditable: true,
        gridviewoptions: false
    },

    markDirty: true,
    disableSelection: true,
    // defaultListenerScope: true,
    // striped: true,
    sortable: false,

    enableMove: false,
    enableDelete: false,

    actions: {
        ADD: {
            text: 'Add'.t(),
            iconCls: 'x-fa fa-plus',
            handler: 'addRecord'
        },
        REVERT: {
            text: 'Revert'.t(),
            iconCls: 'x-fa fa-refresh',
            handler: 'revertChanges'
        }
    },

    controller: {
        onInitialize: function (grid) {
            var columns = [], actions = [];
            // if (grid.enableMove)   { grid.columnsDef.unshift(Column.MOVE); }
            // if (grid.enableDelete) { grid.columnsDef.push(Column.DELETE); }
            Ext.Array.each(grid.columnsDef, function (column) {
                columns.push(Ext.create(column));
            });
            grid.setColumns(columns);

            if (grid.toolbarActions) {
                Ext.Array.each(grid.toolbarActions, function (action) {
                    actions.push(grid.actions[action]);
                });
                grid.insert(1, {
                    xtype: 'toolbar',
                    docked: 'top',
                    items: actions
                });
            }
            if (grid.description) {
                // grid.down('#description').setHtml(grid.description);
                grid.insert(1, {
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
                    html: grid.description
                });
            }
        },


        onPainted: function (grid) {
            var store = grid.getStore();
            if (!store) {
                grid.on('storechange', function (sender, store) {
                    this.validate(store);
                    store.on({
                        datachanged: this.validate,
                        scope: this
                    });
                }, this);
            } else {
                this.validate(store);
                grid.getStore().on({
                    datachanged: this.validate,
                    scope: this
                });
            }

            // setup conditions menu for the grid
            if (grid.conditions && !Ung.conditionsMenu) {
                Ung.conditionsMenu = Ext.create('Ung.cmp.ConditionsMenu');
                Ung.conditionsMenu.setGrid(grid);
            }

            if (grid.enableMove && !Ung.moveMenu) {
                Ung.moveMenu = Ext.create('Ung.cmp.MoveMenu');
                // Ung.moveMenu.setGrid(grid);
            }
        },


        generateMenus: function () {
            var me = this, grid = me.getView();

            // move menu
            me.moveMenu = Ext.create({
                xtype: 'menu',
                itemId: 'moveMenu',
                anchor: true,
                indented: false,
                minWidth: 150,
                items: [{
                    text: 'First'.t(),
                    iconCls: 'x-fa fa-angle-double-up',
                    position: 'first',
                    handler: me.moveRecord
                }, {
                    text: 'Up'.t(),
                    iconCls: 'x-fa fa-angle-up',
                    position: 'up',
                    handler: me.moveRecord
                }, {
                    text: 'Down'.t(),
                    iconCls: 'x-fa fa-angle-down',
                    position: 'down',
                    handler: me.moveRecord
                }, {
                    text: 'Last'.t(),
                    iconCls: 'x-fa fa-angle-double-down',
                    position: 'last',
                    handler: me.moveRecord
                }]
            });
        },

        showConditionsMenu: function (grid, context) {
            Ung.conditionsMenu.showMenu(context);
        },

        showMoveMenu: function (grid, context) {
            Ung.moveMenu.showMenu(grid, context);
        },


        addRecord: function () {
            var me = this,
                grid = me.getView();
            console.log('add');
            grid.getStore().add(Ext.clone(grid.newRecord));
        },

        revertChanges: function () {
            var me = this;
            me.getView().getStore().rejectChanges();
        },


        removeRecord: function (grid, context) {
            context.record.drop();
        },



        validate: function (store) {
            var grid = this.getView(), row, validation;
            // if (!grid.isVisible()) { return; }
            console.log('validate');
            // var store = this.getView().getStore();
            // console.log(grid.getItemAt(0));
            // console.log(store);

            store.each(function (record) {
                row = grid.getItemAt(store.indexOf(record));
                validation = record.getValidation().getData();

                Ext.Array.each(row.cells, function (cell) {
                    if (validation.hasOwnProperty(cell.dataIndex) && validation[cell.dataIndex] !== true ) {
                        cell.setUserCls('invalid-cell');
                    } else {
                        // console.log('valid');
                        cell.setUserCls('');
                    }
                });
                // Ext.Array.each(validations, function (validation) {
                //     console.log(validation);
                // });
            });



            // var records = store.getRecords(), validations;
            // console.log(records);
            // Ext.Array.each(records, function (record) {
            //     var row = grid.getItemAt(store.indexOf(record));
            //     console.log(row);
            //     validations = record.getValidation().getData();
            //     Ext.Array.each(validations, function (validation) {
            //         console.log(validation);
            //     });
            // });

        }

    }

});
