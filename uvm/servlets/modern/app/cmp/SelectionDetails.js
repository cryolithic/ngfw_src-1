Ext.define('Ung.cmp.SelectionDetails', {
    extend: 'Ext.Panel',
    alias: 'widget.selectiondetails',

    viewModel: {
        formulas: {
            data: function (get) {
                return get('grid.selection');
            }
        }
    },

    // header: false,
    resizable: {
        split: true,
        edges: 'west'
    },
    collapsible: {
        collapsed: false,
        animation: false,
        direction: 'right',
        useDrawer: false
        // dynamic: false
    },

    layout: 'fit',

    items: [{
        xtype: 'grid',
        columnLines: true,
        striped: true,
        headers: false,
        disableSelection: true,
        rowLines: false,
        bind: {
            store: {
                data: '{d}'
            }
        },
        columns: [{
            text: 'Key',
            dataIndex: 'key',
            flex: 1,
            align: 'right',
            cell: {
                bodyStyle: {
                    padding: '2px 10px',
                    fontSize: '11px',
                    color: '#777'
                }
            }
        }, {
            text: 'Value',
            dataIndex: 'val',
            flex: 1,
            cell: {
                bodyStyle: {
                    padding: '2px 10px',
                    fontSize: '11px'
                }
            },
            renderer: function (val) { return !val ? '-' : val; }
        }]
    }],

    listeners: {
        'initialize': 'onInit',
        // 'show' : 'onShow'
    },

    controller: {
        onInit: function (el) {
            var grid = el.down('grid'),
                vm = el.getViewModel(),
                arr = [];

            vm.bind('{data}', function (data) {
                if (!data) { return; }
                arr = [];
                // grid.getStore().loadData(data.getData);

                // Ext.Object.getKeys(data.getData()).each(function (key) {
                //     arr.push({ key: data.getData[key]});
                // });

                Ext.Object.each(data.getData(), function (key, value) {
                    arr.push({
                        key: key,
                        val: value
                    });
                });
                vm.set('d', arr);
                console.log(arr);
            });
        }
    }
});
