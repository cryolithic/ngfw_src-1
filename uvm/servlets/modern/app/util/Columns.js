Ext.define('Ung.util.Column', {
    singleton: true,
    alternateClassName: 'Column',

    DELETE: {
        xtype: 'gridcolumn',
        align: 'center',
        text: '<span class="x-fa fa-trash"></span>',
        width: 44,
        resizable: false,
        menuDisabled: true,
        cell: {
            tools: {
                minus: {
                    iconCls: 'x-fa fa-trash',
                    handler: 'removeRecord',
                }
            }
        }
    },

    MOVE: {
        xtype: 'gridcolumn',
        text: '<span class="x-fa fa-sort"></span>',
        width: 44,
        align: 'center',
        resizable: false,
        menuDisabled: true,
        cell: {
            tools: {
                menu: {
                    iconCls: 'x-fa fa-sort',
                    margin: '0 20 0 0',
                    handler: 'showMoveMenu',
                }
            }
        }
    }
});
