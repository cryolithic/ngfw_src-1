Ext.define('Ung.apps.captive-portal.view.Status', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.app-captive-portal-status',
    itemId: 'status',
    title: 'Status'.t(),

    layout: 'border',
    items: [{
        region: 'center',
        border: false,
        bodyPadding: 10,
        scrollable: 'y',
        items: [{
            xtype: 'component',
            cls: 'app-desc',
            html: '<img src="/skins/modern-rack/images/admin/apps/captive-portal_80x80.png" width="80" height="80"/>' +
                '<h3>Captive Portal</h3>' +
                '<p>' + 'Captive Portal allows administrators to require network users to complete a defined process, such as logging in or accepting a network usage policy, before accessing the internet.'.t() + '</p>'
        }, {
            xtype: 'applicense',
            hidden: true,
            bind: {
                hidden: '{!license || !license.trial}'
            }
        }, {
            xtype: 'appstate',
        }, {
            xtype: 'fieldset',
            title: '<i class="fa fa-clock-o"></i> ' + 'Active Sessions'.t(),
            padding: 10,
            margin: '20 0',
            cls: 'app-section',

            layout: 'fit',

            collapsed: true,
            disabled: true,
            bind: {
                collapsed: '{instance.targetState !== "RUNNING"}',
                disabled: '{instance.targetState !== "RUNNING"}'
            },
            items: [{
                xtype: 'grid',
                itemId: 'activeUsers',
                trackMouseOver: false,
                sortableColumns: false,
                enableColumnHide: false,

                minHeight: 120,
                maxHeight: 250,
                viewConfig: {
                    emptyText: '<p style="text-align: center; margin: 0; line-height: 2;"><i class="fa fa-info-circle fa-2x"></i> <br/>No Active Sessions ...</p>',
                    stripeRows: false
                },

                bind: {
                    store: {
                        data: '{activeUsers}'
                    }
                },

                columns: [{
                    header: 'IP Address'.t(),
                    dataIndex: 'userNetAddress',
                    width: Renderer.ipWidth
                }, {
                    header: 'MAC Address'.t(),
                    dataIndex: 'userMacAddress',
                    width: Renderer.macWidth
                }, {
                    header: 'Login Key'.t(),
                    dataIndex: 'macLogin',
                    width: Renderer.messageWidth,
                    renderer: function(value) {
                        return value ? 'MAC Address'.t() : 'IP Address'.t();
                    }
                }, {
                    header: 'User Name'.t(),
                    dataIndex: 'userName',
                    width: Renderer.usernameWidth,
                    flex: 1
                }, {
                    header: 'Login Time'.t(),
                    dataIndex: 'sessionCreation',
                    width: Renderer.timestampWidth,
                    renderer: function(value) { return Util.timestampFormat(value); }
                }, {
                    header: 'Session Count'.t(),
                    dataIndex: 'sessionCounter',
                    width: Renderer.idWidth,
                }, {
                    header: 'Logout'.t(),
                    xtype: 'actioncolumn',
                    width: Renderer.actionWidth,
                    align: 'center',
                    iconCls: 'fa fa-minus-circle',
                    handler: 'logoutUser',
                }],
                bbar: [{
                    text: 'Refresh'.t(),
                    iconCls: 'fa fa-refresh',
                    handler: 'getActiveUsers'
                }]
            }]
        }, {
            xtype: 'appreports'
        }]
    }, {
        region: 'west',
        border: false,
        width: 350,
        minWidth: 300,
        split: true,
        layout: 'border',
        items: [{
            xtype: 'appsessions',
            region: 'north',
            height: 200,
            split: true,
        }, {
            xtype: 'appmetrics',
            region: 'center'
        }],
        bbar: [{
            xtype: 'appremove',
            width: '100%'
        }]
    }]
});
