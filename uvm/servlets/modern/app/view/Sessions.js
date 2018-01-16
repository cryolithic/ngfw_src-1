Ext.define('Ung.view.Sessions', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ung-sessions',

    layout: 'fit',

    items: [{
        xtype: 'grid',
        title: 'Sessions',
        columnLines: true,
        striped: true,
        scrollable: true,
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
            text: 'Client'.t(),
            columns: [{
                text: 'Address'.t() + ' (' + 'Pre-NAT'.t() + ')',
                dataIndex: 'preNatClient',
            }, {
                text: 'Port'.t() + ' (' + 'Pre-NAT'.t() + ')',
                dataIndex: 'preNatClientPort'
            }]
        }, {
            text: 'Server'.t(),
            columns: [{
                text: 'Address'.t() + ' (' + 'Pre-NAT'.t() + ')',
                dataIndex: 'preNatServer',
            }, {
                text: 'Port'.t() + ' (' + 'Pre-NAT'.t() + ')',
                dataIndex: 'preNatServerPort'
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
    }],

    controller: {
        control: {
            '#': {
                activate: 'onActivate'
            }
        },

        onActivate: function () {
            var grid = this.getView().down('grid'),
                store = Ext.getStore('sessions');

            Rpc.asyncData('rpc.sessionMonitor.getMergedSessions')
            .then(function(result) {
                // grid.setLoading(true);
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
