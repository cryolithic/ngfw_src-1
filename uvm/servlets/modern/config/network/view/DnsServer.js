Ext.define('Ung.config.network.view.DnsServer', {
    extend: 'Ext.Panel',
    alias: 'widget.config-network-dns-server',
    itemId: 'dns-server',

    layout: 'hbox',

    defaultType: 'panel',

    items: [{
        title: 'Static DNS Entries'.t(),
        flex: 1,
        layout: 'fit',
        border: '0 1 0 0',
        margin: '0 5 0 0',
        items: [{
            xtype: 'mastergrid',
            flex: 1,
            bind: {
                store: {
                    data: '{settings.dnsSettings.staticEntries.list}',
                    model: 'Ung.model.DnsStaticEntries'
                }
            },
            settingsProperty: 'dnsSettings.staticEntries',
            toolbarActions: ['ADD'],
            emptyText: 'No Filter Rules defined'.t(),            
            enableDelete: true,
            newRecord: {
                name: '',
                address: '1.2.3.4',
                javaClass: 'com.untangle.uvm.network.DnsStaticEntry'
            },               
            columnsDef: [{
                xtype: 'gridcolumn',
                text: 'Name'.t(),
                dataIndex: 'name',
                editable: true,
                flex: 1,
                cell: {
                    encodeHtml: false
                },
                renderer: function (val) {
                    if (!val) {
                        return '<em>enter name</em>'
                    }
                    return val;
                }
            }, {
                xtype: 'gridcolumn',
                text: 'Address'.t(),
                dataIndex: 'address',
                editable: true,
                width: 150,
                cell: {
                    encodeHtml: false
                },
                renderer: function (val) {
                    if (!val) {
                        return '<em>enter address</em>'
                    }
                    return val;
                }
            }]        
        }]
    }, {
        title: 'Domain DNS Servers'.t(),
        flex: 1,
        layout: 'fit',
        border: '0 1 0 0',
        margin: '0 0 0 5',
        items: [{
            xtype: 'mastergrid',
            flex: 1,
            bind: {
                store: {
                    data: '{settings.dnsSettings.localServers.list}',
                    model: 'Ung.model.DnsLocalServers'
                }
            },
            settingsProperty: 'dnsSettings.localServers',
            toolbarActions: ['ADD'],
            emptyText: 'No Domain DNS Servers defined'.t(),            
            enableDelete: true,
            newRecord: {
                domain: '',
                localServer: '',
                javaClass: 'com.untangle.uvm.network.DnsLocalServer'
            },               
            columnsDef: [{
                xtype: 'gridcolumn',
                text: 'Domain'.t(),
                dataIndex: 'domain',
                editable: true,
                flex: 1,
                cell: {
                    encodeHtml: false
                },
                renderer: function (val) {
                    if (!val) {
                        return '<em>enter domain name</em>'
                    }
                    return val;
                }
            }, {
                xtype: 'gridcolumn',
                text: 'Server'.t(),
                dataIndex: 'localServer',
                editable: true,
                width: 150,
                cell: {
                    encodeHtml: false
                },
                renderer: function (val) {
                    if (!val) {
                        return '<em>enter server</em>'
                    }
                    return val;
                }
            }]        
        }]
    }]

});
