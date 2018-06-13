Ext.define('Ung.view.reports.ReportsController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.reports',

    onDeactivate: function (view) {
        var list = view.down('treelist'),
            store = list.getStore();

        store.each(function (node) {
            if (!node.isLeaf()) {
                list.getItem(node).collapse();
            }
        });
        list.setSelection(null);
    },

    onResize: function (el, width) {
        var me = this, vm = me.getViewModel(),
            ratio = vm.get('screen') === 'WIDE' ? 2.5 : 1.5;
        el.setHeight(Ext.Number.parseInt(width/ratio));
    },



    onInitialize: function (view) {
        console.log('initialized reports controller');
        // Ext.getStore('reportstree').build();
        var me = this, vm = view.getViewModel();

        // this.bottomMenu = Ext.Viewport.setMenu({
        //     side: 'bottom',
        //     cover: false,
        //     height: 200
        // });

        vm.bind('{entry}', function (entry) {
            // console.log(entry);
            if (entry.get('type') === 'EVENT_LIST') {
                me.setupColumns(entry);
            }
        });

        vm.bind('{entry.table}', function (table) {
            console.log(table);
            vm.set('tableComboStore', table ? TableConfig2.getComboItems(table) : []);
        });

        me.globalConditionsSheet = Ext.create({
            xtype: 'actionsheet',
            side: 'bottom',
            reveal: false,
            height: 400,
            padding: 0,
            layout: 'fit',
            viewModel: true,
            items: [{
                xtype: 'globalconditions'
            }],
            listeners: {
                beforeexpand: function () {
                    console.log('exp');
                },
                beforehide: function () {
                    console.log('hide');
                },
                // beforehiddenchange: function (el, value) {
                //     if (value) {
                //         return false;
                //     }
                //     // console.log('before', value);
                // }
            }
            // standardButtons: {
            //     cancel: {
            //         text: 'Cancel'.t()
            //     },
            //     apply: {
            //         text: 'Apply'.t()
            //     }
            // }
        });

        // Ext.Viewport.setMenu({
        //     xtype: 'actionsheet',
        //     side: 'bottom',
        //     height: 400,
        //     padding: 0,
        //     layout: 'fit',
        //     viewModel: true,
        //     items: [{
        //         xtype: 'globalconditions'
        //     }],
        //     listeners: {
        //         expand: function () {
        //             console.log('expand');
        //         }
        //     }
        // });
    },

    toggleConditions: function () {
        var me = this;
        me.globalConditionsSheet.show();
        // Ext.Viewport.toggleMenu('bottom');
        // var gc = Ext.Viewport.getMenus().bottom.down('globalconditions');
        var tcs = me.getViewModel().get('tableComboStore');
        me.globalConditionsSheet.getViewModel().set('tableComboStore', tcs);
    },

    // onActivate: function () {
    //     console.log('activate');
    // },

    onSelectionChange: function (el, node) {
        var me = this, record, view = me.getView(), vm = me.getViewModel();
        // var node = arr[0];
        if (!node || !node.get('url')) { return; }
        Ung.app.redirectTo('#reports/' + node.get('url'));


        if (node.isLeaf()) {
            record = Ext.getStore('reports').findRecord('url', node.get('url'), 0, false, true, true);
            if (!record) {
                console.log('No record found!');
                return;
            }

            // switch(record.get('type')) {
            // case 'TEXT': view.down('#reports').setActiveItem('textreport'); break;
            // case 'EVENT_LIST': view.down('#reports').setActiveItem('eventreport'); break;
            // default: view.down('#reports').setActiveItem('graphreport');
            // }
            switch(record.get('type')) {
            case 'TEXT': vm.set('activeItem', 'textreport'); break;
            case 'EVENT_LIST': vm.set('activeItem', 'eventreport'); break;
            default: vm.set('activeItem', 'graphreport');
            }
            vm.set('entry', record);
        }

        // me.lookup('eventreport').setHtml('event report deselected');
        // me.lookup('graphreport').setHtml('graph report deselected');
        // me.lookup('textreport').setHtml('text report deselected');

        // switch(record.get('type')) {
        // case 'EVENT_LIST': me.lookup('eventreport').setHtml('event report selected'); break;
        // case 'TIME_GRAPH':
        // case 'PIE_GRAPH':
        // case 'TIME_GRAPH_DYNAMIC': me.lookup('graphreport').setHtml('graph report selected'); break;
        // case 'TEXT': me.lookup('textreport').setHtml('text report selected'); break;
        // }

    },

    setupColumns: function (entry) {
        var me = this,
            columnsMenu = me.getView().down('#columnsMenu').getMenu(),
            tableConfig = TableConfig2.getColumns(entry.get('table'), entry.get('defaultColumns'));
        columnsMenu.removeAll();
        columnsMenu.add(tableConfig.menuItems);
    },

    showHideColumn: function (item, checked) {
        var me = this, grid = me.getView().down('eventreport'),
            columnsMenu = me.getView().down('#columnsMenu').getMenu(),
            cols = [];

        // var columns = grid.getColumns();
        // Ext.Array.remove(columns, Ext.Array.findBy(columns, function (column) {
        //     return column.getDataIndex() === item.dataIndex;
        // }));
        // grid.setColumns(columns);
        Ext.Array.each(columnsMenu.getItems().items, function (smenu) {
            Ext.Array.each(smenu.getMenu().getItems().items, function (col) {
                if (col.getChecked()) {
                    cols.push(col.dataIndex);
                }
            });
        });
        var c = TableConfig2.getColumns(me.getViewModel().get('entry.table'), cols);
        grid.setColumns(c.columns);
        grid.refresh();
    }


});
