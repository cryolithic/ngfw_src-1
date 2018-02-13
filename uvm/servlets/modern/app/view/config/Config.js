Ext.define('Ung.view.config.Config', {
    extend: 'Ext.Panel',
    alias: 'widget.ung-config',
    itemId: 'config',


    controller: 'config',
    // viewModel: true,
    defaultType: 'panel',

    layout: 'fit',

    items: [{
        docked: 'left',
        width: 250,
        layout: 'fit',

        tbar: {
            items: [{
                xtype: 'searchfield',
                ui: 'faded',
                flex: 1,
                placeholder: 'Find settings...'.t(),
                listeners: {
                    change: 'filterSettings'
                }
            }]
        },
        resizable: {
            split: true,
            edges: 'east'
        },
        // collapsible: {
        //     collapsed: false,
        //     animation: false,
        //     direction: 'left',
        //     useDrawer: false
        // },
        items: [{
            xtype: 'treelist',
            scrollable: true,
            ui: 'nav',
            // micro: true,
            // selectable: {
            //     mode: 'single'
            // },
            floatLeafItems: false,
            singleExpand: true,
            expanderFirst: false,
            expanderOnly: false,
            selectOnExpander: true,
            highlightPath: false,
            store: {
                type: 'tree',
                rootVisible: false,
                filterer: 'bottomup',
                root: {
                    expanded: true,
                    children: [{
                        text: 'Network'.t(),
                        allowDrag: true,
                        // icon: '/skins/modern-rack/images/admin/config/icon_config_network.png',
                        iconCls: 'tree network',
                        // href: '#config/network/interfaces',
                        children: [
                            { text: 'Interfaces'.t(), leaf: true, href: '#config/network/interfaces' },
                            { text: 'Hostname'.t(), leaf: true, href: '#config/network/hostname' },
                            { text: 'Services'.t(), leaf: true },
                            { text: 'Port Forward Rules'.t(), leaf: true },
                            { text: 'NAT Rules'.t(), leaf: true, href: '#config/network/nat-rules' },
                            { text: 'Bypass Rules'.t(), leaf: true, href: '#config/network/bypass-rules' },
                            { text: 'Filter Rules'.t(), leaf: true, href: '#config/network/filter-rules' },
                            { text: 'Routes'.t(), leaf: true },
                            { text: 'DNS Server'.t(), leaf: true, href: '#config/network/dns-server' },
                            { text: 'DHCP Server'.t(), leaf: true },
                            { text: 'Advanced'.t(),
                                children: [
                                    { text: 'Options'.t(), leaf: true },
                                    { text: 'QoS'.t(), leaf: true },
                                    { text: 'Access Rules'.t(), leaf: true },
                                    { text: 'UPnP'.t(), leaf: true },
                                    { text: 'DNS & DHCP'.t(), leaf: true },
                                    { text: 'Network Cards'.t(), leaf: true },
                                    { text: 'Netflow'.t(), leaf: true }
                                ]
                            },
                            { text: 'Troubleshooting'.t(), leaf: true }
                        ]
                    }, {
                        text: 'Administration'.t(),
                        iconCls: 'tree administration',
                        children: [
                            { text: 'Admin'.t(), leaf: true },
                            { text: 'Certificates'.t(), leaf: true },
                            { text: 'SNMP'.t(), leaf: true },
                            { text: 'Skins'.t(), leaf: true }
                        ]
                    }, {
                        text: 'Events'.t(),
                        iconCls: 'tree events',
                        children: [
                            { text: 'Alerts'.t(), leaf: true },
                            { text: 'Triggers'.t(), leaf: true },
                            { text: 'Syslog'.t(), leaf: true }
                        ]
                    }, {
                        text: 'Email'.t(),
                        iconCls: 'tree email',
                        children: [
                            { text: 'Outgoing Server'.t(), leaf: true },
                            { text: 'Safe List'.t(), leaf: true },
                            { text: 'Quarantine'.t(), leaf: true }
                        ]
                    }, {
                        text: 'Local Directory'.t(),
                        iconCls: 'tree directory',
                        children: [
                            { text: 'Local Users'.t(), leaf: true }
                        ]
                    }, {
                        text: 'System'.t(),
                        iconCls: 'tree system',
                        children: [
                            { text: 'Regional'.t(), leaf: true },
                            { text: 'Support'.t(), leaf: true },
                            { text: 'Backup'.t(), leaf: true },
                            { text: 'Restore'.t(), leaf: true },
                            { text: 'Protocols'.t(), leaf: true },
                            { text: 'Shield'.t(), leaf: true }
                        ]
                    }, {
                        text: 'Upgrade'.t(), leaf: true,
                        iconCls: 'tree upgrade',
                    }, {
                        text: 'About'.t(),
                        iconCls: 'tree about',
                        children: [
                            { text: 'Server'.t(), leaf: true },
                            { text: 'License'.t(), leaf: true },
                            { text: 'License Agreement'.t(), leaf: true }
                        ]
                    }]
                }
            },
            listeners: {
                selectionchange: function (el, record) {
                    // console.log(record);
                    if (!record || !record.get('href')) { return; }
                    Ung.app.redirectTo(record.get('href'));
                }
            }
        }]
    }]
});
