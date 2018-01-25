Ext.define('Ung.view.Sessions', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ung-sessions',

    layout: 'fit',

    viewModel: true,

    items: [{
        items: [{
            xtype: 'toolbar',
            docked: 'top',
            defaults: {
                // margin: '0 5',
                // ui: 'round'
            },
            items: [{
                html: 'Refresh'.t(),
                iconCls: 'x-fa fa-repeat',
                tooltip: {
                    html: 'Refresh'.t()
                },
                handler: 'fetchSessions'
            }, {
                html: 'Auto Refresh'.t(),
                iconCls: 'x-fa fa-square-o',
                enableToggle: true
            }, {
                html: 'Reset'.t(),
                iconCls: 'x-fa fa-refresh',
            }, '->', {
                xtype: 'searchfield',
                width: 250,
                ui: 'faded',
                placeholder: 'Filter sessions...'.t()
            }]
        }],

        title: 'Sessions'.t(),

        xtype: 'grid',
        reference: 'grid',
        columnLines: true,
        striped: true,
        scrollable: true,
        userSelectable: true,
        store: 'sessions',
        columns: [{
            text: 'Protocol'.t(),
            dataIndex: 'protocol'
        }, {
            text: 'Bypassed'.t(),
            dataIndex: 'bypassed',
            renderer: function (val) { return val ? 'YES' : 'NO'; }
        }, {
            text: 'Hostname'.t(),
            dataIndex: 'hostname'
        }, {
            text: 'Client'.t() + ' (' + 'Pre-NAT'.t() + ')',
            columns: [{
                text: 'Address'.t(),
                dataIndex: 'preNatClient',
            }, {
                text: 'Port'.t(),
                dataIndex: 'preNatClientPort',
                align: 'right'
            }]
        }, {
            text: 'Server'.t() + ' (' + 'Pre-NAT'.t() + ')',
            columns: [{
                text: 'Address'.t(),
                dataIndex: 'preNatServer'
            }, {
                text: 'Port'.t(),
                dataIndex: 'preNatServerPort',
                align: 'right'
            }]
        }, {
            text: 'Speed (KB/s)'.t(),
            columns: [{
                text: 'Client'.t(),
                dataIndex: 'clientKBps',
                align: 'right',
                renderer: function (val) { return val ? val : 0; }
            }, {
                text: 'Server'.t(),
                dataIndex: 'serverKBps',
                align: 'right',
                renderer: function (val) { return val ? val : 0; }
            }, {
                text: 'Total'.t(),
                dataIndex: 'totalKBps',
                align: 'right',
                renderer: function (val) { return val ? val : 0; }
            }]
        }]
    }, {
        xtype: 'selectiondetails',
        title: 'Session full details'.t(),
        docked: 'right',
        width: 350,
        hidden: true,
        bind: {
            hidden: '{!grid.selection}',
        }
    }],

    controller: {
        control: {
            '#': {
                activate: 'fetchSessions'
            }
        },



        fetchSessions: function () {
            var grid = this.getView().down('grid'),
                store = Ext.getStore('sessions');
            console.log('fetch');

            grid.mask();
            Rpc.asyncData('rpc.sessionMonitor.getMergedSessions')
            .then(function(result) {
                grid.unmask();
                var sessions = result.list;

                sessions.forEach( function( session ){
                    var key;
                    if( session.attachments ){
                        for(key in session.attachments.map ){
                            session[key] = session.attachments.map[key];
                        }
                        delete session.attachments;
                    }
                });

                store.loadData( sessions );

                if(store.getSorters().items.length == 0){
                    store.sort('bypassed', 'ASC');
                }
            });
        }
    }
});
