Ext.define('Ung.config.network.view.Interfaces', {
    extend: 'Ext.Panel',
    alias: 'widget.config-network-interfaces',
    itemId: 'interfaces',
    scrollable: true,

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
            dataIndex: 'connected',
            width: Renderer.iconWidth,
            align: 'center',
            resizable: false,
            sortable: false,
            hideable: false,
            // renderer: Ung.config.network.MainController.connectedIconRenderer
        }, {
            text: 'Id'.t(),
            dataIndex: 'interfaceId',
            width: Renderer.idWidth,
            resizable: false,
            align: 'right',
            renderer: Renderer.id
        }, {
            width: Renderer.iconWidth,
            align: 'center',
            resizable: false,
            sortable: false,
            hideable: false,
            menuDisabled: true,
            // renderer: Ung.config.network.MainController.interfacetypeRenderer
        }, {
            text: 'Name'.t(),
            dataIndex: 'name',
            width: Renderer.messageWidth,
            flex: 1
        }, {
            text: 'Connected'.t(),
            dataIndex: 'connected',
            width: Renderer.idWidth,
            // renderer: Ung.config.network.MainController.connectedRenderer
        }, {
            text: 'Device'.t(),
            dataIndex: 'physicalDev',
            width: Renderer.idWidth,
            // renderer: Ung.config.network.MainController.deviceRenderer
        }, {
            text: 'Speed'.t(),
            dataIndex: 'mbit',
            width: Renderer.sizeWidth,
            // renderer: Ung.config.network.MainController.speedRenderer
        }, {
            text: 'Duplex'.t(),
            dataIndex: 'duplex',
            width: Renderer.idWidth,
            // renderer: Ung.config.network.MainController.duplexRenderer
        }, {
            text: 'Config'.t(),
            dataIndex: 'configType',
            width: Renderer.idWidth,
            // renderer: Ung.config.network.MainController.addressedRenderer
        }, {
            text: 'Current Address'.t(),
            dataIndex: 'v4Address',
            width: Renderer.networkWidth,
            // renderer: Ung.config.network.MainController.addressRenderer
        }, {
            text: 'is WAN'.t(),
            width: Renderer.booleanWidth,
            resizable: false,
            dataIndex: 'isWan',
            align: 'center',
        }, {
            text: '',
            align: 'center',
            cell: {
                tools: {
                    expand: {
                        iconCls: 'x-fa fa-pencil green',
                        handler: 'onEditInterface'
                    },
                    minus: {
                        iconCls: 'x-fa fa-minus-circle'
                    }
                }
            }
        }]
    }]
});
