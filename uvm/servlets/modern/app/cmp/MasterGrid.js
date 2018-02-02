Ext.define('Ung.cmp.MasterGrid', {
    extend: 'Ext.grid.Grid',
    alias: 'widget.mastergrid',

    listeners: {
        initialize: 'onInitialize',
        painted: 'onPainted'
    },

    disableSelection: true,
    // defaultListenerScope: true,
    // striped: true,

    enableMove: false,
    enableDelete: false,

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
            var columns = [];
            if (grid.enableMove)   { grid.columnsDef.unshift(Column.MOVE); }
            if (grid.enableDelete) { grid.columnsDef.push(Column.DELETE); }
            Ext.Array.each(grid.columnsDef, function (column) {
                columns.push(Ext.create(column));
            });
            grid.setColumns(columns);
        },


        onPainted: function () {
            // var me = this;
            // if (me.conditionsMenu) {
            //     console.log('SUUUUUNT');
            // } else {
            //     console.log('NU SUUUUUNT');

            // }
            this.generateMenus();
        },


        generateMenus: function () {
            var me = this, grid = me.getView();

            me.conditionsMenu = Ext.create({
                xtype: 'menu',
                anchor: true,
                padding: '10 0',
                defaultType: 'menucheckitem',
                mouseLeaveDelay: 30,
                tbar: {
                    items: [{
                        xtype: 'component',
                        html: 'Conditions'.t()
                    }]
                },
                listeners: {
                    beforehide: 'onBeforeHideConditions',
                    scope: me
                },
                defaults: {
                    menu: {
                        padding: '10 0',
                        indented: false
                        // defaultType: 'menucheckitem'
                    }
                }
            });

            Ext.Array.each(grid.conditions, function(condition) {
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
                        padding: 0,
                        items: [{
                            xtype: 'togglefield',
                            label: 'IS',
                            labelAlign: 'left',
                            labelWidth: 'auto',
                            boxLabel: 'IS NOT'
                        }]
                    };
                }
                me.conditionsMenu.add(mitem);
            });

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
            var me = this;

            Ext.Array.each(me.conditionsMenu.getItems().items, function (item) {
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
                var found = Ext.Array.findBy(me.conditionsMenu.getItems().items, function (item) {
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
            });

            me.conditionsMenu.record = context.record;
            me.conditionsMenu.showBy(context.tool.el, 't0-b0');
        },

        onBeforeHideConditions: function (menu) {
            var me = this, list = [], invert = false, value, arrValue = [];
            console.log(me);
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
                        javaClass: me.getView().conditionClass,
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
