Ext.define('Ung.cmp.MasterGrid', {
    extend: 'Ext.grid.Grid',
    alias: 'widget.mastergrid',

    listeners: {
        painted: 'onPainted'
    },

    items: [{
        xtype: 'toolbar',
        docked: 'top',
        items: [{
            text: 'Add'.t(),
            ui: 'action',
            iconCls: 'x-fa fa-plus'
        }]
    }],

    controller: {
        onPainted: function () {
            console.log('painted');
            this._generateRulesMenu();
        },

        showMenu: function (grid, context) {
            var me = this;

            // uncheck all conditions
            Ext.Array.each(me.menu.getItems().items, function (item) {
                if (Ext.isFunction(item.setChecked)) {
                    item.setChecked(false);
                }
            });


            Ext.Array.each(context.record.get('conditions').list, function (cond) {
                var found = Ext.Array.findBy(me.menu.getItems().items, function (item) {
                    // console.log(item.type, cond.conditionType);
                    return item.type === cond.conditionType;
                });
                if (found) {
                    // console.log(cond);
                    // console.log(found);
                    found.setChecked(true);
                    // console.log(found.getMenu().getDefaultType());
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
                }
            }, this);

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
                mouseLeaveDelay: 0,
                // maxHeight: 200,
                // scrollable: true,
                tbar: {
                    items: [{
                        xtype: 'component',
                        html: 'Conditions'.t()
                    }]
                },
                defaults: {
                    menu: {
                        padding: '10 0',
                        // defaultType: 'menucheckitem',
                        tbar: {
                            layout: {
                                pack: 'center'
                            },
                            items: [{
                                xtype: 'togglefield',
                                label: 'Equals',
                                labelAlign: 'left',
                                labelWidth: 'auto',
                                boxLabel: 'NOT Equals'
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
                        }
                    }
                }
            });

            Ext.Array.each(this.getView().conditions, function(condition) {
                this.menu.add(condition);
            }, this);
        }
    }

});
