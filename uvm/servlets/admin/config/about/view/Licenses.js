Ext.define('Ung.config.about.view.Licenses', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.config-about-licenses',
    itemId: 'licenses',

    title: 'Licenses'.t(),
    layout: 'fit',
    tbar: [{
        xtype: 'tbtext',
        padding: '8 5',
        style: { fontSize: '12px' },
        html: Ext.String.format('Licenses determine entitlement to paid applications and services. Click Refresh to force reconciliation with the license server.'.t(), '<b>', '</b>')
    }],

    items: [{
        xtype: 'ungrid',
        controller: 'unaboutlicensegrid',
        itemId: 'licenses',
        bind: {
            store: {
                data: '{licenses}'
            }
        },
        columns: [{
            header: 'Name'.t(),
            dataIndex: 'displayName',
            width: 150
        }, {
            header: 'App'.t(),
            dataIndex: 'currentName',
            flex: 1
        }, {
            header: 'UID'.t(),
            dataIndex: 'UID',
            width: 150
        }, {
            header: 'Start Date'.t(),
            dataIndex: 'start',
            width: 240,
            formatter: 'this.dateRenderer'
        }, {
            header: 'End Date'.t(),
            dataIndex: 'end',
            width: 240,
            formatter: 'this.dateRenderer'
        }, {
            header: 'Seats'.t(),
            dataIndex: 'seatsDisplay',
            width: 50
        }, {
            header: 'Valid'.t(),
            dataIndex: 'valid',
            width: 50
        }, {
            header: 'Status',
            dataIndex: 'status',
            width: 150
        }],

    }],

    bbar: [{
        text: 'Refresh'.t(),
        iconCls: 'fa fa-refresh',
        handler: 'reloadLicenses'
    }]

});
