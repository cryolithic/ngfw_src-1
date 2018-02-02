Ext.define('Ung.cmp.MasterGrid', {
    extend: 'Ext.grid.Grid',
    alias: 'widget.mastergrid',

    listeners: {
        // initialize: 'onInitialize',
        painted: 'onPainted'
    },

    disableSelection: true,
    // striped: true,

    items: [{
        xtype: 'toolbar',
        docked: 'top',
        items: [{
            text: 'Add'.t(),
            ui: 'action',
            iconCls: 'x-fa fa-plus',
            handler: 'addRecord'
        }]
    }],

    controller: {
        onInitialize: function (grid) {
            console.log(grid.getColumns());
            var columns = grid.getColumns();
            // Ext.Array.each(columns, function (col) {
            //     delete col['$initParent'];
            // });
            columns.push(Ext.create({
                xtype: 'gridcolumn',
                text: 'aaa',
                width: 100
            }));
            console.log(columns);
            grid.setColumns(columns);
            grid.refresh();
            // // columns.push(newcol);
            // grid.headerCt.insert(columns.length, newcol);
        },


        onPainted: function () {
            this._generateRulesMenu();
        },

        showMenu: function (grid, context) {
            var me = this;

            // uncheck all conditions
            Ext.Array.each(me.menu.getItems().items, function (item) {
                if (Ext.isFunction(item.getMenu)) {
                    item.setChecked(false);
                    item.getMenu().setMasked(true);

                    if (item.getMenu().down('togglefield')) {
                        item.getMenu().down('togglefield').setValue(false);
                    }

                    if (item.getMenu().getDefaultType() === 'textfield') {
                        item.getMenu().down('textfield').setValue('');
                    }
                    if (item.getMenu().getDefaultType() === 'menucheckitem') {
                        Ext.Array.each(item.getMenu().getItems().items, function (item2) {
                            if (Ext.isFunction(item2.setChecked)) {
                                item2.setChecked(false);
                            }
                        });
                    }
                    if (item.getMenu().getDefaultType() === 'menuradioitem') {
                        item.getMenu().setGroups({ option: false });
                    }
                }
            });

            Ext.Array.each(context.record.get('conditions').list, function (cond) {
                var found = Ext.Array.findBy(me.menu.getItems().items, function (item) {
                    return item.conditionType === cond.conditionType;
                });
                if (found) {
                    // console.log(cond);
                    // console.log(found);
                    found.setChecked(true);
                    // console.log(found.getMenu().getDefaultType());

                    if (found.getMenu().down('togglefield')) {
                        found.getMenu().down('togglefield').setValue(cond.invert);
                    }

                    if (found.getMenu().getDefaultType() === 'textfield') {
                        found.getMenu().down('textfield').setValue(cond.value);
                    }
                    if (found.getMenu().getDefaultType() === 'menucheckitem') {
                        Ext.Array.each(cond.value.split(','), function (val) {
                            var found2 = Ext.Array.findBy(found.getMenu().getItems().items, function (item2) {
                                if (!Ext.isFunction(item2.getValue)) { return; }
                                return item2.getValue() === val;
                            });
                            if (found2) {
                                found2.setChecked(true);
                            }
                        });
                    }
                    if (found.getMenu().getDefaultType() === 'menuradioitem') {
                        found.getMenu().setGroups({ option: cond.invert });
                    }
                }
            }, this);

            this.menu.record = context.record;
            this.menu.showBy(context.tool.el, 't0-b0');
        },

        _generateRulesMenu: function () {
            var me = this;
            me.menu = Ext.create({
                xtype: 'menu',
                // viewModel: {},
                anchor: true,
                padding: '10 0',
                defaultType: 'menucheckitem',
                mouseLeaveDelay: 30,
                // maxHeight: 200,
                // scrollable: true,
                tbar: {
                    items: [{
                        xtype: 'component',
                        html: 'Conditions'.t()
                    }]
                },
                listeners: {
                    beforehide: me.onBeforeHide
                },
                defaults: {
                    menu: {
                        padding: '10 0',
                        indented: false
                        // defaultType: 'menucheckitem'
                    }
                }
            });

            Ext.Array.each(this.getView().conditions, function(condition) {
                var mitem = {
                    text: condition.text,
                    conditionType: condition.conditionType,
                    menu: {
                        // anchor: true,
                        minWidth: 200,
                        align: 'tr-br?',
                        defaultType: condition.type,
                    },
                    listeners: {
                        checkchange: function (mitem, checked) {
                            mitem.getMenu().setMasked(!checked);
                            if (!checked) {
                                if (mitem.getMenu().getDefaultType() === 'textfield') {
                                    mitem.getMenu().down('textfield').setValue('');
                                }
                                if (mitem.getMenu().getDefaultType() === 'menucheckitem') {
                                    Ext.Array.each(mitem.getMenu().getItems().items, function (item2) {
                                        if (Ext.isFunction(item2.setChecked)) {
                                            item2.setChecked(false);
                                        }
                                    });
                                }
                            }
                        }
                    }
                };
                if (condition.type === 'textfield') {
                    mitem.menu.items = [
                        { placeholder: 'enter address', iconCls: 'x-fa fa-font' }
                    ];
                }
                if (condition.type === 'menucheckitem') {
                    mitem.menu.items = condition.values;
                }
                if (condition.type === 'menuradioitem') {
                    mitem.menu.groups = {
                        option: true
                    },
                    mitem.menu.items = [{
                        text: 'Yes'.t(),
                        group: 'option',
                        value: false
                    }, {
                        text: 'No'.t(),
                        group: 'option',
                        value: true
                    }];
                }
                if (condition.type !== 'menuradioitem') {
                    mitem.menu.bbar = {
                        layout: {
                            pack: 'center'
                        },
                        items: [{
                            xtype: 'togglefield',
                            label: 'IS',
                            labelAlign: 'left',
                            labelWidth: 'auto',
                            boxLabel: 'IS NOT'
                            // xtype: 'combobox',
                            // queryMode: 'local',
                            // displayField: 'text',
                            // valueField: 'invert',
                            // editable: false,
                            // value: false,
                            // flex: 1,
                            // store: [
                            //     { text: 'Equals'.t(), invert: false },
                            //     { text: 'Not Equals'.t(), invert: true }
                            // ]
                        }]
                    };
                }
                this.menu.add(mitem);
            }, this);


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
                // listeners: {
                //     hide: function (menu) {
                //         // menu.down('#moveAfterMenu').getMenu().removeAll();
                //     }
                // }
            });


        },

        onBeforeHide: function (menu) {
            var list = [], invert = false, value, arrValue = [];
            Ext.Array.each(menu.getItems().items, function (item) {
                if (!Ext.isFunction(item.getMenu)) { return; }

                if (item.getMenu().down('togglefield')) {
                    invert = item.getMenu().down('togglefield').getValue();
                }

                if (item.getChecked()) {
                    if (item.getMenu().getDefaultType() === 'textfield') {
                        value = item.getMenu().down('textfield').getValue();
                    }
                    if (item.getMenu().getDefaultType() === 'menucheckitem') {
                        arrValue = [];
                        Ext.Array.each(item.getMenu().getItems().items, function (item2) {
                            if (Ext.isFunction(item2.getChecked) && item2.getChecked()) {
                                arrValue.push(item2.getValue());
                            }
                        });
                        value = arrValue.join(',');
                    }
                    if (item.getMenu().getDefaultType() === 'menuradioitem') {
                        invert = item.getMenu().getGroups().option;
                        value = '';
                    }
                    list.push({
                        conditionType: item.conditionType,
                        invert: invert,
                        javaClass: 'com.untangle.uvm.network.NatRuleCondition',
                        value: value
                    });
                }
            });
            menu.record.set('conditions', {
                javaClass: 'java.util.LinkedList',
                list: list
            });
        },




        showMoveMenu: function (grid, context) {
            var me = this;
            var index = grid.getStore().indexOf(context.record),
                items = this.moveMenu.getItems().items,
                count = grid.getStore().count();

            Ext.Array.each(items, function (item, index) {
                item.setDisabled(false);
                if (index === 4) {
                    this.moveMenu.remove(item);
                }
            }, this);

            if (index === 0) {
                items[0].setDisabled(true);
                items[1].setDisabled(true);
            }

            if (index === (count - 1)) {
                items[2].setDisabled(true);
                items[3].setDisabled(true);
            }

            var recMenuItems = [];
            grid.getStore().each(function (record, index) {
                // if (context.record === record) {
                //     return;
                // }
                recMenuItems.push({ text: '#' + record.get('ruleId') + ' - ' +  record.get('description'), position: index });
            });

            // this.moveMenu.down('#moveAfterMenu').add(recMenuItems);
            // Ext.Array(this.moveMenu.down('#moveAfterMenu').getItems(), function (item) {
            //     item.addListener()
            // }, this);
            // this.moveMenu.down('#moveAfterMenu').setMenu({
            //     indented: false,
            //     itemId: 'moveAfterMenu',
            //     defaults: {
            //         handler: me.moveRecord
            //     },
            //     items: recMenuItems
            // });
            this.moveMenu.add({
                text: 'Move After',
                iconCls: 'x-fa fa-angle-right',
                menu: {
                    indented: false,
                    defaults: {
                        handler: me.moveRecord
                    },
                    items: recMenuItems
                }
            });

            this.moveMenu.record = context.record;
            this.moveMenu.showBy(context.tool.el, 't0-b0');
        },


        moveRecord: function (item) {
            var record = item.up('#moveMenu').record,
                store = record.store,
                index = store.indexOf(record);

            store.remove(record);

            switch (item.position) {
            case 'first': store.insert(0, record); break;
            case 'up':    store.insert(index - 1, record); break;
            case 'down':  store.insert(index + 1, record); break;
            case 'last':  store.add(record); break;
            default:      store.insert(item.position + 1, record);
            }

        },

        addRecord: function () {
            var me = this,
                grid = me.getView();
            console.log('add');
            grid.getStore().add(Ext.clone(grid.newRecord));
        },

        removeRecord: function (grid, context) {
            context.record.drop();
        }
    }

});
