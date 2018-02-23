Ext.define('TableConfig2', {
    alternateClassName: 'TableConfig2',
    singleton: true,

    getColumns: function (tableName, defaultColumns) {
        console.log(defaultColumns);
        var columnIds = this[tableName], columns = [], menuItems = [];
        if (!columnIds) {
            console.error('No such table: ' + tableName);
            return;
        }
        Ext.Array.each(this[tableName], function (group) {
            var smenu = [];
            Ext.Array.each(group.fields, function (id) {
                if (Ext.Array.contains(defaultColumns, id)) {
                    columns.push(Ext.apply(Ext.clone(this.columns[id]), {
                        text: this.columns[id].text + '</br/><span style="font-size: 10px; color: #999;">[ ' + id + ' ]</span>',
                        menuText: this.columns[id].text,
                        // menuText: '<strong>' + this.columns[id].text + '</strong> <span style="color: #999;">[' + id + ']</span>',
                        dataIndex: id,
                        sortable: true,
                        hideable: false,
                        // menuDisabled: true,
                        cell: {
                            encodeHtml: false
                        }
                        // hidden: !Ext.Array.contains(defaultColumns, id)
                    }));
                }
                smenu.push({
                    text: this.columns[id].text,
                    dataIndex: id,
                    checked: Ext.Array.contains(defaultColumns, id)
                });
            }, this);
            menuItems.push({
                text: group.text,
                xtype: 'menuitem',
                menu: {
                    defaultType: 'menucheckitem',
                    defaults: {
                        listeners: {
                            checkchange: 'showHideColumn'
                        }
                    },
                    items: smenu
                }
            });
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
            text: 'Session Id'.t(),
            width: 120,
            resizable: false
        },
        time_stamp: {
            text: 'Timestamp'.t(),
            width: 120
        },
        start_time: {
            text: 'Start Timestamp'.t(),
            width: 120
        },
        end_time: {
            text: 'End Timestamp'.t(),
            width: 120
        },
        bypassed: {
            text: 'Bypassed'.t(),
            width: 90,
            align: 'center',
            resizable: false,
            renderer: function (val) {
                return val === true ? 'YES' : 'NO';
            }
        },
        entitled: {
            text: 'Entitled'.t(),
            width: 90,
            align: 'center',
            resizable: false,
            renderer: function (val) {
                return val === true ? 'YES' : 'NO';
            }
        },
        protocol: {
            text: 'Protocol'.t(),
            width: 90,
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
            renderer: function (val) { return val || '-'; }
        },
        hostname: {
            text: 'Hostname'.t(),
        },
        c_client_addr: {
            text: 'Client'.t(),
        },
        c_client_port: {
            text: 'Client Port'.t(),
            align: 'right',
            width: 90,
            resizable: false
        },
        s_client_addr: {
            text: 'New Client'.t(),
        },
        s_client_port: {
            text: 'New Client Port'.t(),
            align: 'right',
            width: 90,
            resizable: false
        },
        c_server_addr: {
            text: 'Original Server'.t(),
            width: 120
        },
        c_server_port: {
            text: 'Original Server Port'.t(),
            align: 'right',
            width: 90,
            resizable: false
        },
        s_server_addr: {
            text: 'Server'.t(),
            width: 120
        },
        s_server_port: {
            text: 'Server Port'.t(),
            align: 'right',
            width: 90,
            resizable: false
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
        // Application Control Lite
        application_control_lite_protocol: {
            text: 'Protocol'.t() + ' (Application Control Lite)'
        },
        application_control_lite_blocked: {
            text: 'Blocked'.t() + ' (Application Control Lite)',
        },
        // SSL Inspector
        ssl_inspector_ruleid: {
            text: 'Rule Id'.t() + ' (SSL Inspector)',
        },
        ssl_inspector_status: {
            text: 'Status'.t() + ' (SSL Inspector)',
        },
        ssl_inspector_detail: {
            text: 'Detail'.t() + ' (SSL Inspector)',
        },
        // Firewall
        firewall_blocked: {
            text: 'Blocked'.t() + ' (Firewall)',
        },
        firewall_flagged: {
            text: 'Flagged'.t() + ' (Firewall)',
        },
        firewall_rule_index: {
            text: 'Rule Id'.t() + ' (Firewall)',
        },
        // Captive Portal
        captive_portal_blocked: {
            text: 'Captured'.t() + ' (Captive Portal)',
        },
        captive_portal_rule_index: {
            text: 'Rule Id'.t() + ' (Captive Portal)',
        },
        // Bytes
        p2s_bytes: {
            text: 'To-Server Bytes'.t(),
        },
        s2p_bytes: {
            text: 'From-Server Bytes'.t()
        },
        p2c_bytes: {
            text: 'To-Client Bytes'.t(),
        },
        c2p_bytes: {
            text: 'From-Client Bytes'.t(),
        },
        s2c_bytes: {
            text: 'From-Server Bytes'.t(),
            align: 'right',
            width: 90,
            resizable: false,
            renderer: Renderer.datasize
        },
        c2s_bytes: {
            text: 'From-Client Bytes'.t(),
            align: 'right',
            width: 90,
            resizable: false,
            renderer: Renderer.datasize
        }
    },

    // tables
    sessions: [{
        text: 'Common'.t(),
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
        text: 'Bytes'.t(),
        fields: [
            'p2s_bytes',
            's2p_bytes',
            'p2c_bytes',
            'c2p_bytes'
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
    }, {
        text: 'Application Control',
        fields: [
            'application_control_ruleid',
            'application_control_application',
            'application_control_protochain',
            'application_control_category',
            'application_control_blocked',
            'application_control_flagged',
            'application_control_confidence',
            'application_control_detail'
        ]
    }, {
        text: 'Application Control Lite',
        fields: [
            'application_control_lite_protocol',
            'application_control_lite_blocked'
        ]
    }, {
        text: 'SSL Inspector',
        fields: [
            'ssl_inspector_ruleid',
            'ssl_inspector_status',
            'ssl_inspector_detail'
        ]
    }, {
        text: 'Firewall',
        fields: [
            'firewall_blocked',
            'firewall_flagged',
            'firewall_rule_index'
        ]
    }, {
        text: 'Captive Portal',
        fields: [
            'captive_portal_blocked',
            'captive_portal_rule_index'
        ]
    }],

    session_minutes: [{
        text: 'Common'.t(),
        fields: [
            'session_id',
            'time_stamp',
            'start_time',
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
        text: 'Bytes'.t(),
        fields: [
            's2c_bytes',
            'c2s_bytes'
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
    }, {
        text: 'Application Control',
        fields: [
            'application_control_ruleid',
            'application_control_application',
            'application_control_protochain',
            'application_control_category',
            'application_control_blocked',
            'application_control_flagged',
            'application_control_confidence',
            'application_control_detail'
        ]
    }, {
        text: 'Application Control Lite',
        fields: [
            'application_control_lite_protocol',
            'application_control_lite_blocked'
        ]
    }, {
        text: 'SSL Inspector',
        fields: [
            'ssl_inspector_ruleid',
            'ssl_inspector_status',
            'ssl_inspector_detail'
        ]
    }, {
        text: 'Firewall',
        fields: [
            'firewall_blocked',
            'firewall_flagged',
            'firewall_rule_index'
        ]
    }, {
        text: 'Captive Portal',
        fields: [
            'captive_portal_blocked',
            'captive_portal_rule_index'
        ]
    }]
});
