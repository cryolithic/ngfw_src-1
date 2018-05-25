Ext.define('Ung.config.network.view.Interfaces', {
    extend: 'Ext.Panel',
    alias: 'widget.config-network-interfaces',
    itemId: 'interfaces',
    scrollable: true,

    viewModel: true,

    layout: 'fit',

    // title: 'Interfaces'.t(),

    // tbar: [{
    //     xtype: 'tbtext',
    //     padding: '8 5',
    //     style: { fontSize: '12px' },
    //     html: '<strong>' + 'Interface configuration'.t() + '</strong> <br/>' +  'Use this page to configure each interface\'s configuration and its mapping to a physical network card.'.t()
    // }],

    items: [{
        xtype: 'grid',
        itemId: 'interfacesGrid',
        reference: 'interfacesGrid',

        // bind: {
        //     plugins: {
        //         rowexpander: '{ screen !== "WIDE"}'
        //     },
        // },
        plugins: {
            rowexpander: true
        },


        itemConfig: {
            style: {
                fontSize: '11px'
            },
            body: {
                cls: 'interface-expander',
                tpl: '<table cellspacing=0 cellpadding=0>' +
                        '<tr><td>Interface ID: </td><td>{interfaceId}</td></tr>' +
                        '<tr><td>Connected: </td><td>{connected}</td></tr>' +
                        '<tr><td>Device: </td><td>{physicalDev}</td></tr>' +
                        '<tr><td>Speed: </td><td>{mbit}</td></tr>' +
                        '<tr><td>Duplex: </td><td>{duplex}</td></tr>' +
                        '<tr><td>Config Type: </td><td>{configType}</td></tr>' +
                        '<tr><td>Current Address: </td><td>{v4Address}</td></tr>' +
                     '</table>'
            }
        },
        // tbar: [{
        //     text: 'Refresh'.t(),
        //     iconCls: 'fa fa-refresh',
        //     handler: 'externalAction',
        //     action: 'loadSettings'
        // }, {
        //     text: 'Add Tagged VLAN Interface'.t(),
        //     iconCls: 'fa fa-plus',
        //     hidden: true,
        //     bind: { hidden: '{!settings.vlansEnabled}' },
        //     handler: 'externalAction',
        //     action: 'editInterface'
        // }, {
        //     text: 'Remap Interfaces'.t(),
        //     iconCls: 'fa fa-random',
        //     handler: 'externalAction',
        //     action: 'remapInterfaces'
        // }],

        // layout: 'fit',

        bind: '{interfaces}',
        sortableColumns: false,
        fields: [
            'interfaceId'
        ],
        columns: [{
            text: 'Name (WAN)'.t(),
            dataIndex: 'name',
            minWidth: 200,
            cell: {
                style: 'font-weight: bold;'
            },
            flex: 1,
            renderer: function (val, rec) {
                return val + (rec.get('isWan') ? ' (WAN)' : '');
            }
        }, {
            dataIndex: 'connected',
            width: 100,
            align: 'center',
            resizable: false,
            sortable: false,
            // hideable: false,
            hidden: true,
            cell: {
                encodeHtml: false,
            },
            renderer: function (val) {
                if (val === 'CONNECTED') {
                    return '<i class="x-fa fa-stop"></i>';
                }
            }
            // renderer: Ung.config.network.MainController.connectedIconRenderer
        }, {
            text: 'Id'.t(),
            dataIndex: 'interfaceId',
            width: 100,
            resizable: false,
            align: 'right',
            hidden: true,
            // renderer: Renderer.id
        },
        //     {
        //     width: Renderer.iconWidth,
        //     align: 'center',
        //     resizable: false,
        //     sortable: false,
        //     hideable: false,
        //     menuDisabled: true,
        //     // renderer: Ung.config.network.MainController.interfacetypeRenderer
        // },
            {
            text: 'Connected'.t(),
            dataIndex: 'connected',
            width: Renderer.idWidth,
            hidden: true,
            bind: { hidden: '{ screen !== "WIDE" }' }
            // renderer: Ung.config.network.MainController.connectedRenderer
        }, {
            text: 'Device'.t(),
            dataIndex: 'physicalDev',
            hidden: true,
            bind: { hidden: '{ screen !== "WIDE" }' }
            // renderer: Ung.config.network.MainController.deviceRenderer
        }, {
            text: 'Speed'.t(),
            dataIndex: 'mbit',
            width: Renderer.sizeWidth,
            hidden: true,
            bind: { hidden: '{ screen !== "WIDE" }' }
            // renderer: Ung.config.network.MainController.speedRenderer
        }, {
            text: 'Duplex'.t(),
            dataIndex: 'duplex',
            width: 140,
            hidden: true,
            bind: { hidden: '{ screen !== "WIDE" }' }
            // renderer: Ung.config.network.MainController.duplexRenderer
        }, {
            text: 'Config'.t(),
            dataIndex: 'configType',
            width: 100,
            hidden: true,
            bind: { hidden: '{ screen !== "WIDE" }' }
            // renderer: Ung.config.network.MainController.addressedRenderer
        }, {
            text: 'Current Address'.t(),
            dataIndex: 'v4Address',
            width: 140,
            hidden: true,
            bind: { hidden: '{ screen !== "WIDE" }' }
            // renderer: Ung.config.network.MainController.addressRenderer
        }, {
            text: 'is WAN'.t(),
            width: 80,
            resizable: false,
            dataIndex: 'isWan',
            align: 'center',
            hidden: true,
            bind: { hidden: '{ screen !== "WIDE" }' }
        }, {
            text: '',
            align: 'center',
            width: 60,
            cell: {
                tools: {
                    expand: {
                        iconCls: 'x-fa fa-pencil-square fa-lg',
                        // handler: 'onEditInterface'
                    }
                }
            }
        }]
    }]
});
