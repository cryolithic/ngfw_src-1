Ext.define('Ung.cmp.MoveMenu', {
    extend: 'Ext.menu.Menu',
    itemId: 'moveMenu',
    anchor: true,
    indented: false,
    minWidth: 150,

    config: {
        record: null,
        grid: null
    },

    listeners: {
        initialize: 'onInitialize'
    },

    onInitialize: function (menu) {
        menu.add([{
            text: 'First'.t(),
            iconCls: 'x-fa fa-angle-double-up',
            position: 'first',
            handler: 'moveRecord',
            scope: this
        }, {
            text: 'Up'.t(),
            iconCls: 'x-fa fa-angle-up',
            position: 'up',
            handler: 'moveRecord',
            scope: this
        }, {
            text: 'Down'.t(),
            iconCls: 'x-fa fa-angle-down',
            position: 'down',
            handler: 'moveRecord',
            scope: this
        }, {
            text: 'Last'.t(),
            iconCls: 'x-fa fa-angle-double-down',
            position: 'last',
            handler: 'moveRecord',
            scope: this
        }]);
    },

    showMenu: function (grid, context) {
        var me = this;
        var index = grid.getStore().indexOf(context.record),
            items = this.getItems().items,
            count = grid.getStore().count();

        Ext.Array.each(items, function (item, index) {
            item.setDisabled(false);
            if (index === 4) {
                me.remove(item);
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
            recMenuItems.push({ text: '#' + record.get('ruleId') + ' - ' +  record.get('description'), position: index });
        });

        me.add({
            text: 'Move After',
            iconCls: 'x-fa fa-angle-right',
            menu: {
                indented: false,
                defaults: {
                    handler: 'moveRecord',
                    scope: me
                },
                items: recMenuItems
            }
        });

        this.record = context.record;
        this.showBy(context.tool.el, 't0-b0');
    },

    moveRecord: function (item) {
        var record = this.record,
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

    }
});
