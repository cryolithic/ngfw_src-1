Ext.define('TableConfig2', {
    alternateClassName: 'TableConfig2',
    singleton: true,

    getColumns: function (tableName) {
        var columnIds = this[tableName], columns = [], menuItems = [];
        if (!columnIds) {
            console.error('No such table: ' + tableName);
            return;
        }
        Ext.Array.each(this[tableName], function (group) {

            Ext.Array.each(group.fields, function (id) {
                columns.push(Ext.apply(Ext.clone(this.columns[id]), {
                    text: this.columns[id].text + '</br/><span style="font-size: 10px; color: #999;">[ ' + id + ' ]</span>',
                    menuText: this.columns[id].text,
                    // menuText: '<strong>' + this.columns[id].text + '</strong> <span style="color: #999;">[' + id + ']</span>',
                    dataIndex: id,
                    sortable: true,
                    menuDisabled: true
                }));
            }, this);

            if (!group.text) {
                Ext.Array.each(group.fields, function (id) {
                    menuItems.push({
                        text: this.columns[id].text,
                        dataIndex: id
                    });
                }, this);
            } else {
                var smenu = [];
                Ext.Array.each(group.fields, function (id) {
                    smenu.push({
                        text: this.columns[id].text,
                        dataIndex: id
                    });
                }, this);
                menuItems.push({
                    text: group.text,
                    xtype: 'menuitem',
                    menu: {
                        defaultType: 'menucheckitem',
                        items: smenu
                    }
                });
            }
        }, this);



        // Ext.Array.each(columnIds, function (id) {
        //     columns.push(Ext.apply(this.columns[id], {
        //         text: this.columns[id].text + '</br/><span style="font-size: 10px; color: #999;">[ ' + id + ' ]</span>',
        //         menuText: this.columns[id].text,
        //         // menuText: '<strong>' + this.columns[id].text + '</strong> <span style="color: #999;">[' + id + ']</span>',
        //         dataIndex: id,
        //         sortable: true,
        //         menuDisabled: true
        //     }));
        // }, this);
        return {
            columns: columns,
            menuItems: menuItems
        };
    },

    columns: {
        session_id: {
            text: 'Session Id'.t()
        },
        time_stamp: {
            text: 'Timestamp'.t()
        },
        end_time: {
            text: 'End Timestamp'.t()
        },
        bypassed: {
            text: 'Bypassed'.t(),
        },
        entitled: {
            text: 'Entitled'.t(),
        },
        protocol: {
            text: 'Protocol'.t(),
            width: 90,
            align: 'right',
            resizable: false,
            renderer: Renderer.protocol
        },
        icmp_type: {
            text: 'ICMP Type'.t(),
        },
        policy_id: {
            text: 'Policy Id'.t(),
        },
        policy_rule_id: {
            text: 'Policy Rule Id'.t(),
        },
        client_intf: {
            text: 'Client Interface'.t(),
        },
        server_intf: {
            text: 'Server Interface'.t(),
        },
        client_country: {
            text: 'Client Country'.t(),
        },
        client_latitude: {
            text: 'Client Latitude'.t(),
        },
        client_longitude: {
            text: 'Client Longitude'.t(),
        },
        server_country: {
            text: 'Server Country'.t(),
        },
        server_latitude: {
            text: 'Server Latitude'.t(),
        },
        server_longitude: {
            text: 'Server Longitude'.t(),
        },
        username: {
            text: 'Username'.t(),
        },
        hostname: {
            text: 'Hostname'.t(),
        },
        c_client_addr: {
            text: 'Client'.t(),
        },
        c_client_port: {
            text: 'Client Port'.t(),
        },
        s_client_addr: {
            text: 'New Client'.t(),
        },
        s_client_port: {
            text: 'New Client Port'.t(),
        },
        c_server_addr: {
            text: 'Original Server'.t(),
        },
        c_server_port: {
            text: 'Original Server Port'.t(),
        },
        s_server_addr: {
            text: 'Server'.t(),
        },
        s_server_port: {
            text: 'Server Port'.t(),
        },
        tags: {
            text: 'Tags'.t(),
        },
        filter_prefix: {
            text: 'Filter Prefix'.t(),
        },
        // Bandwidth Control
        bandwidth_control_priority: {
            text: 'Priority'.t() + ' (Bandwidth Control)',
        },
        bandwidth_control_rule: {
            text: 'Rule'.t() + ' (Bandwidth Control)',
        },
        // Application Control
        application_control_ruleid: {
            text: 'Rule Id'.t() + ' (Application Control)',
        },
        application_control_application: {
            text: 'Application'.t() + ' (Application Control)',
        },
        application_control_protochain: {
            text: 'ProtoChain'.t() + ' (Application Control)',
        },
        application_control_category: {
            text: 'Category'.t() + ' (Application Control)',
        },
        application_control_blocked: {
            text: 'Blocked'.t() + ' (Application Control)',
        },
        application_control_flagged: {
            text: 'Flagged'.t() + ' (Application Control)',
        },
        application_control_confidence: {
            text: 'Confidence'.t() + ' (Application Control)',
        },
        application_control_detail: {
            text: 'Detail'.t() + ' (Application Control)',
        },
    },

    // tables
    sessions: [{
        fields: [
            'session_id',
            'time_stamp',
            'end_time',
            'bypassed',
            'entitled',
            'protocol',
            'icmp_type',
            'policy_id',
            'policy_rule_id',
            'username',
            'hostname',
            'tags',
            'filter_prefix'
        ]
    }, {
        text: 'Client'.t(),
        fields: [
            'client_intf',
            'c_client_addr',
            'c_client_port',
            's_client_addr',
            's_client_port'
        ]
    }, {
        text: 'Server'.t(),
        fields: [
            'server_intf',
            'c_server_addr',
            'c_server_port',
            's_server_addr',
            's_server_port'
        ]
    }, {
        text: 'Geography'.t(),
        fields: [
            'client_country',
            'client_latitude',
            'client_longitude',
            'server_country',
            'server_latitude',
            'server_longitude'
        ]
    }, {
        text: 'Bandwidth Control',
        fields: [
            'bandwidth_control_priority',
            'bandwidth_control_rule'
        ]
    }]
});
