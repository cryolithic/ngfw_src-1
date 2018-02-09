Ext.define('Ung.cmp.ConditionsMenu', {
    extend: 'Ext.menu.Menu',
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
        beforehide: 'onBeforeHideConditions'
    },
    defaults: {
        menu: {
            padding: '10 0',
            indented: false
            // defaultType: 'menucheckitem'
        }
    },
    
    config: {
        record: null,
        grid: null
    },

    setGrid: function (grid) {
        var me = this;
        if (me.grid && me.grid.getId() === grid.getId()) {
            return;
        }
        me.removeAll();
        me.grid = grid;

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
            me.add(mitem);
        });
    },

    showMenu: function (context) {
        var me = this;
        this.record = context.record;

        Ext.Array.each(me.getItems().items, function (item) {
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
            var found = Ext.Array.findBy(me.getItems().items, function (item) {
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

        this.showBy(context.tool.el, 't0-b0');
    },

    onBeforeHideConditions: function (menu) {
        var me = this, list = [], invert = false, value, arrValue = [];

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
                    javaClass: menu.grid.conditionClass,
                    value: value
                });
            }
        });
        menu.record.set('conditions', {
            javaClass: 'java.util.LinkedList',
            list: list
        });
    },    
});