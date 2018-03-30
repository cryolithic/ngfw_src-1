Ext.define('Ung.view.dashboard.Manager', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.dashboardmanager',
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        // border: false,
        // ui: 'footer',
        // style: { background: '#FFFFFF' },
        items: [{
            xtype: 'component',
            html: 'Manage Widgets'.t()
        }, '->', {
            // iconCls: 'fa fa-cog',
            focusable: false,
            text: 'Options'.t(),
            menu: {
                plain: true,
                showSeparator: false,
                mouseLeaveDelay: 0,
                items: [
                    { text: 'Import'.t(), iconCls: 'fa fa-download', handler: 'importWidgets' },
                    { text: 'Export'.t(), iconCls: 'fa fa-upload', handler: 'exportWidgets' },
                    '-',
                    { text: 'Create New'.t(), iconCls: 'fa fa-area-chart', handler: 'addWidget' },
                    '-',
                    { text: 'Reorder'.t(), iconCls: 'fa fa-sort', handler: 'reorderWidgets' },
                    '-',
                    { text: 'Reset to Defaults'.t(), iconCls: 'fa fa-rotate-left', handler: 'resetDashboard' }
                ]
            }
        }]
    }],

    reference: 'dashboardManager',
    itemId: 'dashboardMaanager',
    width: 250,
    minWidth: 250,
    maxWidth: 350,
    bodyBorder: false,
    animCollapse: false,
    floatable: false,
    cls: 'widget-manager',
    // disableSelection: true, // if disabled the drag/drop ordering does not work
    split: true,
    hideHeaders: true,
    rowLines: false,
    hidden: true,
    bind: {
        hidden: '{!managerVisible}'
    },
    store: 'widgets',
    viewConfig: {
        plugins: {
            ptype: 'gridviewdragdrop',
            dragText: 'Drag and drop to reorganize'.t(),
            dragZone: {
                onBeforeDrag: function (data, e) {
                    return Ext.get(e.target).hasCls('fa-align-justify');
                }
            }
        },
        stripeRows: false,
        getRowClass: function (record) {
            var cls = !record.get('enabled') ? 'disabled' : '';
            cls += record.get('markedForDelete') ? ' will-remove' : '';
            return cls;
        },
        listeners: {
            drop: 'onDrop'
        }
    },
    columns: [{
        width: 28,
        align: 'center',
        hidden: true,
        renderer: function (val, meta) {
            meta.tdCls = 'reorder';
            return '<i class="fa fa-align-justify"></i>';
        }
    }, {
        width: 20,
        align: 'center',
        sortable: false,
        hideable: false,
        resizable: false,
        menuDisabled: true,
        //handler: 'toggleWidgetEnabled',
        dataIndex: 'enabled',
        renderer: 'enableRenderer'
    }, {
        dataIndex: 'entryId',
        renderer: 'widgetTitleRenderer',
        flex: 1
    }, {
        xtype: 'widgetcolumn',
        width: 30,
        align: 'center',
        widget: {
            xtype: 'button',
            width: 24,
            enableToggle: true,
            iconCls: 'fa fa-trash fa-gray',
            hidden: true,
            focusable: false,
            bind: {
                hidden: '{record.type !== "ReportEntry"}',
                iconCls: 'fa fa-trash {record.markedForDelete ? "fa-red" : "fa-gray"}',
            },
            handler: 'removeWidget'
        }
    }],
    listeners: {
        itemmouseleave : 'onItemLeave',
        cellclick: 'onItemClick'
    },
    fbar: ['->', {
        text: 'Cancel'.t(),
        iconCls: 'fa fa-ban',
        handler: 'toggleManager'
    }, {
        text: 'Apply'.t(),
        iconCls: 'fa fa-floppy-o',
        handler: 'applyChanges'
    }]

});
