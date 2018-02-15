Ext.define('TableConfig', {
    alternateClassName: 'TableConfig',
    singleton: true,

    getConfig: function(tableName) {
        if(TableConfig.validated == false){
            TableConfig.validate();
        }
        return TableConfig.tableConfig[tableName];
    },

    checkHealth: function() {
        if(!rpc.reportsManager) {
            console.info('Reports not installed!');
            return;
        }
        var i, table, column, systemColumns, systemColumnsMap, tableConfigColumns, tableConfigColumnsMap;
        var systemTables = rpc.reportsManager.getTables();
        var systemTablesMap={};
        var missingTables = [];
        for(i=0; i<systemTables.length;i++) {
            systemTablesMap[systemTables[i]] = true;

            if(!this.tableConfig[systemTables[i]]) {

                // ignore 'totals' tables (from old reports and will be deprecated soon)
                if ( systemTables[i].indexOf('totals') !== -1 ) {
                    continue;
                }
                // ignore 'mail_msgs' table (will be deprecated soon)
                if ( systemTables[i].indexOf('mail_msgs') !== -1 ) {
                    continue;
                }
                missingTables.push(systemTables[i]);
            }
        }
        if(missingTables.length>0) {
            console.log('Warning: Missing tables: ' + missingTables.join(', '));
        }
        var extraTables = [];
        for (table in this.tableConfig) {
            if (this.tableConfig.hasOwnProperty(table)) {
                if(!systemTablesMap[table]) {
                    extraTables.push(table);
                }
            }
        }
        if (extraTables.length > 0) {
            console.log('Warning: Extra tables: ' + extraTables.join(', '));
        }

        for (table in this.tableConfig) {
            tableConfigColumns = this.tableConfig[table].columns;
            if(systemTablesMap[table]) {
                systemColumns = rpc.reportsManager.getColumnsForTable(table);
                systemColumnsMap = {};
                tableConfigColumnsMap = {};
                for(i=0;i<tableConfigColumns.length; i++) {
                    tableConfigColumnsMap[tableConfigColumns[i].dataIndex] = tableConfigColumns[i];
                }
                var missingColumns = [];
                for(i=0;i<systemColumns.length; i++) {
                    systemColumnsMap[systemColumns[i]] = true;
                    var columnConfig = tableConfigColumnsMap[systemColumns[i]];
                    if ( columnConfig === null ) {
                        missingColumns.push(systemColumns[i]);
                    } else {
                        if (! columnConfig.width ) {
                            console.log('Warning: Table "' + table + '" Columns: "' + columnConfig.dataIndex + '" missing width');
                        }
                    }
                }
                if (missingColumns.length > 0) {
                    console.log('Warning: Table "' + table + '" Missing columns: ' + missingColumns.join(', '));
                }

                var extraColumns = [];
                for (column in tableConfigColumnsMap) {
                    if (!systemColumnsMap[column]) {
                        extraColumns.push(column);
                    }
                }
                if (extraColumns.length > 0) {
                    console.log('Warning: Table "' + table + '" Extra columns: ' + extraColumns.join(', '));
                }

            }
        }

    },

    getColumnsForTable: function(table, store) {
        if(table !== null) {
            var tableConfig = this.getConfig(table);
            var columns = [], col;
            if(tableConfig !== null && Ext.isArray(tableConfig.columns)) {
                for(var i = 0; i<tableConfig.columns.length; i++) {
                    col = tableConfig.columns[i];
                    var name = col.header;
                    columns.push({
                        dataIndex: col.dataIndex,
                        text: name
                    });
                }
            }

            store.loadData(columns);
        }
    },

    getColumnHumanReadableName: function(columnName) {
        if(!this.columnsHumanReadableNames) {
            this.columnsHumanReadableNames = {};
            if(!this.tableConfig) {
                this.buildTableConfig();
            }
            var i, table, columns, dataIndex;
            for (table in this.tableConfig) {
                columns = this.tableConfig[table].columns;
                for(i=0; i<columns.length; i++) {
                    dataIndex = columns[i].dataIndex;
                    if(dataIndex && !this.columnsHumanReadableNames[dataIndex]) {
                        this.columnsHumanReadableNames[dataIndex] = columns[i].header;
                    }
                }
            }
        }
        if(!columnName) {
            columnName = '';
        }
        var readableName = this.columnsHumanReadableNames[columnName];
        return readableName !== null ? readableName : columnName.replace(/_/g,' ');
    },

    // new methods .........
    generate: function (table) {
        var checkboxes = [], comboItems = [];
        var tableConfig = this.tableConfig[table];

        if (!tableConfig) {
            console.log('Table not found!');
            return;
        }

        // generate checkboxes and menu
        Ext.Array.each(tableConfig.columns, function (column) {
            checkboxes.push({ boxLabel: column.header, inputValue: column.dataIndex, name: 'cbGroup' });
            comboItems.push({
                text: column.header,
                value: column.dataIndex
            });
        });
        tableConfig.checkboxes = checkboxes;
        tableConfig.comboItems = comboItems;

        return tableConfig;
    },

    validated: false,
    validate: function(){
        for(var table in TableConfig.tableConfig){
            if(table == 'syslog'){
                continue;
            }
            TableConfig.tableConfig[table].fields.forEach( function( field ){
                // if(!field.type &&
                //     ( !field.sortType ||
                //       field.sortType != 'asTimestamp' ) ){
                //     console.log(table + ": field=" + field.name + ", missing type" );
                // }
            });
            TableConfig.tableConfig[table].columns.forEach( function( column ){
                if(column.width === undefined){
                    console.log(table + ":" + column.header + ", no width");
                }
                if(!column.filter &&
                    ( !column.xtype || column.xtype != "actioncolumn") ){
                    console.log(table + ": column=" + column.header + ", no filter");
                }
            });
        }
        TableConfig.validated = true;
    },

    // end new methods

    tableConfig: {
        sessions: {
            fields: [{
                name: 'session_id',
            }, {
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'end_time',
                sortType: 'asTimestamp'
            }, {
                name: 'bypassed',
                type: 'boolean'
            }, {
                name: 'entitled',
                type: 'boolean'
            }, {
                name: 'protocol',
                convert: Converter.protocol
            }, {
                name: 'icmp_type',
                convert: Converter.icmp
            }, {
                name: 'hostname',
                type: 'string'
            }, {
                name: 'username',
                type: 'string',
                sortType: 'asUnString'
            }, {
                name: 'tags'
            }, {
                name: 'policy_id',
                convert: Converter.policy
            }, {
                name: 'policy_rule_id'
            }, {
                name: 'c_client_addr',
                sortType: 'asIp'
            }, {
                name: 'c_client_port',
                sortType: 'asInt'
            }, {
                name: 'c_server_addr',
                sortType: 'asIp'
            }, {
                name: 'c_server_port',
                sortType: 'asInt'
            }, {
                name: 's_client_addr',
                sortType: 'asIp'
            }, {
                name: 's_client_port',
                sortType: 'asInt'
            }, {
                name: 's_server_addr',
                sortType: 'asIp'
            }, {
                name: 's_server_port',
                sortType: 'asInt'
            }, {
                name: 'client_intf',
                convert: Converter.interface
            }, {
                name: 'server_intf',
                convert: Converter.interface
            }, {
                name: 'client_country',
                convert: Converter.country
            }, {
                name: 'client_latitude'
            }, {
                name: 'client_longitude'
            }, {
                name: 'server_country',
                convert: Converter.country
            }, {
                name: 'server_latitude'
            }, {
                name: 'server_longitude'
            }, {
                name: 'c2p_bytes',
                sortType: 'asInt'
            }, {
                name: 'p2c_bytes',
                sortType: 'asInt'
            }, {
                name: 's2p_bytes',
                sortType: 'asInt'
            }, {
                name: 'p2s_bytes',
                sortType: 'asInt'
            }, {
                name: 'filter_prefix',
                type: 'string',
                sortType: 'asUnString'
            }, {
                name: 'firewall_blocked'
            }, {
                name: 'firewall_flagged'
            }, {
                name: 'firewall_rule_index'
            }, {
                name: 'application_control_lite_blocked'
            }, {
                name: 'application_control_lite_protocol',
                type: 'string',
                sortType: 'asUnString'
            }, {
                name: 'captive_portal_rule_index'
            }, {
                name: 'captive_portal_blocked'
            }, {
                name: 'application_control_application',
                type: 'string',
                sortType: 'asUnString'
            }, {
                name: 'application_control_protochain',
                type: 'string',
                sortType: 'asUnString'
            }, {
                name: 'application_control_category',
                type: 'string',
                sortType: 'asUnString'
            }, {
                name: 'application_control_flagged'
            }, {
                name: 'application_control_blocked'
            }, {
                name: 'application_control_confidence'
            }, {
                name: 'application_control_detail',
                type: 'string',
                sortType: 'asUnString'
            }, {
                name: 'application_control_ruleid'
            }, {
                name: 'bandwidth_control_priority'
            }, {
                name: 'bandwidth_control_rule',
                convert: Converter.bandwidthControlRule
            }, {
                name: 'ssl_inspector_status',
                type: 'string',
                sortType: 'asUnString'
            }, {
                name: 'ssl_inspector_detail',
                type: 'string',
                sortType: 'asUnString'
            }, {
                name: 'ssl_inspector_ruleid'
            }],
            columns: [{
                text: 'Session Id'.t(),
                dataIndex: 'session_id',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.numericFilter
            }, {
                xtype: 'datecolumn',
                text: 'Timestamp'.t(),
                dataIndex: 'time',
                // width: Renderer.timestampWidth,
                sortable: true,
                format: 'h:i:s a'
                // renderer: Renderer.timestamp,
                // filter: Renderer.timestampFilter
            }, {
                text: 'End Timestamp'.t(),
                dataIndex: 'end_time',
                width: Renderer.timestampWidth,
                sortable: true,
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Bypassed'.t(),
                dataIndex: 'bypassed',
                width: Renderer.booleanWidth,
                sortable: true,
                rtype: 'boolean',
                filter: Renderer.booleanFilter
            }, {
                text: 'Entitled'.t(),
                dataIndex: 'entitled',
                width: Renderer.booleanWidth,
                sortable: true,
                rtype: 'boolean',
                filter: Renderer.booleanFilter,
            }, {
                text: 'Protocol'.t(),
                align: 'right',
                dataIndex: 'protocol',
                sortable: true,
                menuDisabled: true,
                renderer: Renderer.protocol,
            }, {
                text: 'ICMP Type'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'icmp_type'
            }, {
                text: 'Policy Id'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'policy_id'
            }, {
                text: 'Policy Rule Id'.t(),
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'policy_rule_id'
            }, {
                text: 'Client Interface'.t() ,
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'client_intf'
            }, {
                text: 'Server Interface'.t() ,
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'server_intf'
            }, {
                text: 'Client Country'.t() ,
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'client_country'
            }, {
                text: 'Client Latitude'.t() ,
                width: Renderer.locationWidth,
                sortable: true,
                dataIndex: 'client_latitude',
                filter: Renderer.numericFilter
            }, {
                text: 'Client Longitude'.t() ,
                width: Renderer.locationWidth,
                sortable: true,
                dataIndex: 'client_longitude',
                filter: Renderer.numericFilter
            }, {
                text: 'Server Country'.t() ,
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'server_country'
            }, {
                text: 'Server Latitude'.t() ,
                width: Renderer.locationWidth,
                sortable: true,
                dataIndex: 'server_latitude',
                filter: Renderer.numericFilter
            }, {
                text: 'Server Longitude'.t() ,
                width: Renderer.locationWidth,
                sortable: true,
                dataIndex: 'server_longitude',
                filter: Renderer.numericFilter
            }, {
                text: 'Username'.t(),
                width: Renderer.usernameWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'username'
            }, {
                text: 'Hostname'.t(),
                width: Renderer.hostnameWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'hostname'
            }, {
                text: 'Client'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'c_client_addr'
            }, {
                text: 'Client Port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                dataIndex: 'c_client_port',
                filter: Renderer.numericFilter
            }, {
                text: 'New Client'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 's_client_addr'
            }, {
                text: 'New Client Port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                dataIndex: 's_client_port',
                filter: Renderer.numericFilter
            }, {
                text: 'Original Server'.t() ,
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'c_server_addr'
            }, {
                text: 'Original Server Port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                dataIndex: 'c_server_port',
                filter: Renderer.numericFilter
            }, {
                text: 'Server'.t() ,
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 's_server_addr'
            }, {
                text: 'Server Port'.t(),
                width: Renderer.portWidth,
                // Ugh.  Don't like this...
                flex: 1,
                sortable: true,
                dataIndex: 's_server_port',
                filter: Renderer.numericFilter
            }, {
                text: 'Tags'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'tags'
            }, {
                text: 'Filter Prefix'.t(),
                width: Renderer.messageWidth,
                flex: 1,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'filter_prefix'
            }, {
                text: 'Priority'.t() + ' (Bandwidth Control)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'bandwidth_control_priority',
                rtype: 'priority'
            }, {
                text: 'Rule'.t() + ' (Bandwidth Control)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                flex: 1,
                dataIndex: 'bandwidth_control_rule',
            }, {
                text: 'Rule Id'.t() + ' (Application Control)',
                width: Renderer.messageWidth,
                sortable: true,
                dataIndex: 'application_control_ruleid',
                filter: Renderer.numericFilter
            }, {
                text: 'Application'.t() + ' (Application Control)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'application_control_application'
            }, {
                text: 'ProtoChain'.t() + ' (Application Control)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'application_control_protochain'
            }, {
                text: 'Category'.t() + ' (Application Control)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'application_control_category'
            }, {
                text: 'Blocked'.t() + ' (Application Control)',
                width: Renderer.booleanWidth,
                sortable: true,
                dataIndex: 'application_control_blocked',
                filter: Renderer.booleanFilter
            }, {
                text: 'Flagged'.t() + ' (Application Control)',
                width: Renderer.booleanWidth,
                sortable: true,
                dataIndex: 'application_control_flagged',
                filter: Renderer.booleanFilter
            }, {
                text: 'Confidence'.t() + ' (Application Control)',
                width: Renderer.portWidth,
                sortable: true,
                dataIndex: 'application_control_confidence',
                filter: Renderer.numericFilter
            }, {
                text: 'Detail'.t() + ' (Application Control)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                flex: 1,
                dataIndex: 'application_control_detail'
            },{
                text: 'Protocol'.t() + ' (Application Control Lite)',
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'application_control_lite_protocol',
                rtype: 'protocol'
            }, {
                text: 'Blocked'.t() + ' (Application Control Lite)',
                width: Renderer.booleanWidth,
                sortable: true,
                dataIndex: 'application_control_lite_blocked',
                flex: 1,
                filter: Renderer.booleanFilter
            }, {
                text: 'Rule Id'.t() + ' (SSL Inspector)',
                width: Renderer.idWidth,
                sortable: true,
                dataIndex: 'ssl_inspector_ruleid',
                filter: Renderer.numericFilter
            }, {
                text: 'Status'.t() + ' (SSL Inspector)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'ssl_inspector_status'
            }, {
                text: 'Detail'.t() + ' (SSL Inspector)',
                width: Renderer.messageWidth,
                flex: 1,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'ssl_inspector_detail'
            }, {
                text: 'Blocked'.t() + ' (Firewall)',
                width: Renderer.booleanWidth,
                sortable: true,
                dataIndex: 'firewall_blocked',
                filter: Renderer.booleanFilter
            }, {
                text: 'Flagged'.t() + ' (Firewall)',
                width: Renderer.booleanWidth,
                sortable: true,
                dataIndex: 'firewall_flagged',
                filter: Renderer.booleanFilter
            }, {
                text: 'Rule Id'.t() + ' (Firewall)',
                width: Renderer.idWidth,
                sortable: true,
                flex:1,
                dataIndex: 'firewall_rule_index',
                filter: Renderer.numericFilter
            }, {
                text: 'Captured'.t() + ' (Captive Portal)',
                width: Renderer.messageWidth,
                sortable: true,
                dataIndex: 'captive_portal_blocked',
                filter: Renderer.booleanFilter
            }, {
                text: 'Rule Id'.t() + ' (Captive Portal)',
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                flex: 1,
                dataIndex: 'captive_portal_rule_index'
            }, {
                text: 'To-Server Bytes'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                dataIndex: 'p2s_bytes',
                rtype: 'datasize',
                filter: Renderer.numericFilter
            }, {
                text: 'From-Server Bytes'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                dataIndex: 's2p_bytes',
                rtype: 'datasize',
                filter: Renderer.numericFilter
            }, {
                text: 'To-Client Bytes'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                dataIndex: 'p2c_bytes',
                rtype: 'datasize',
                filter: Renderer.numericFilter
            }, {
                text: 'From-Client Bytes'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                dataIndex: 'c2p_bytes',
                rtype: 'datasize',
                filter: Renderer.numericFilter
            }]
        },
        session_minutes: {
            fields: [{
                name: 'session_id'
            }, {
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'start_time',
                sortType: 'asTimestamp'
            }, {
                name: 'end_time',
                sortType: 'asTimestamp'
            }, {
                name: 'bypassed'
            }, {
                name: 'entitled'
            }, {
                name: 'protocol',
                convert: Converter.protocol
            }, {
                name: 'icmp_type',
                convert: Converter.icmp
            }, {
                name: 'hostname'
            }, {
                name: 'username'
            }, {
                name: 'tags'
            }, {
                name: 'policy_id',
                convert: Converter.policy
            }, {
                name: 'policy_rule_id'
            }, {
                name: 'c_client_addr',
                sortType: 'asIp'
            }, {
                name: 'c_client_port',
                sortType: 'asInt'
            }, {
                name: 'c_server_addr',
                sortType: 'asIp'
            }, {
                name: 'c_server_port',
                sortType: 'asInt'
            }, {
                name: 's_client_addr',
                sortType: 'asIp'
            }, {
                name: 's_client_port',
                sortType: 'asInt'
            }, {
                name: 's_server_addr',
                sortType: 'asIp'
            }, {
                name: 's_server_port',
                sortType: 'asInt'
            }, {
                name: 'client_intf',
                convert: Converter.interface
            }, {
                name: 'server_intf',
                convert: Converter.interface
            }, {
                name: 'client_country',
                convert: Converter.country
            }, {
                name: 'client_latitude'
            }, {
                name: 'client_longitude'
            }, {
                name: 'server_country',
                convert: Converter.country
            }, {
                name: 'server_latitude'
            }, {
                name: 'server_longitude'
            }, {
                name: 'c2p_bytes',
                sortType: 'asInt'
            }, {
                name: 'p2c_bytes',
                sortType: 'asInt'
            }, {
                name: 's2p_bytes',
                sortType: 'asInt'
            }, {
                name: 'p2s_bytes',
                sortType: 'asInt'
            }, {
                name: 'filter_prefix'
            }, {
                name: 'firewall_blocked'
            }, {
                name: 'firewall_flagged'
            }, {
                name: 'firewall_rule_index'
            }, {
                name: 'application_control_lite_blocked'
            }, {
                name: 'application_control_lite_protocol',
                type: 'string'
            }, {
                name: 'captive_portal_rule_index'
            }, {
                name: 'captive_portal_blocked'
            }, {
                name: 'application_control_application',
                type: 'string'
            }, {
                name: 'application_control_protochain',
                type: 'string'
            }, {
                name: 'application_control_category',
                type: 'string'
            }, {
                name: 'application_control_flagged'
            }, {
                name: 'application_control_blocked'
            }, {
                name: 'application_control_confidence'
            }, {
                name: 'application_control_detail'
            }, {
                name: 'application_control_ruleid'
            }, {
                name: 'bandwidth_control_priority'
            }, {
                name: 'bandwidth_control_rule',
                convert: Converter.bandwidthControlRule
            }, {
                name: 'ssl_inspector_status'
            }, {
                name: 'ssl_inspector_detail'
            }, {
                name: 'ssl_inspector_ruleid'
            }],
            columns: [{
                text: 'Session Id'.t(),
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'session_id'
            }, {
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Start Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'start_time',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'End Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'end_time',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Bypassed'.t(),
                width: Renderer.booleanWidth,
                sortable: true,
                dataIndex: 'bypassed',
                filter: Renderer.booleanFilter
            }, {
                text: 'Entitled'.t(),
                width: Renderer.booleanWidth,
                sortable: true,
                dataIndex: 'entitled',
                filter: Renderer.booleanFilter
            }, {
                text: 'Protocol'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'protocol',
            }, {
                text: 'ICMP Type'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'icmp_type'
            }, {
                text: 'Policy Id'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'policy_id'
            }, {
                text: 'Policy Rule Id'.t(),
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'policy_rule_id'
            }, {
                text: 'Client Interface'.t() ,
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'client_intf'
            }, {
                text: 'Server Interface'.t() ,
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'server_intf'
            }, {
                text: 'Client Country'.t() ,
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'client_country',
            }, {
                text: 'Client Latitude'.t() ,
                width: Renderer.locationWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'client_latitude'
            }, {
                text: 'Client Longitude'.t() ,
                width: Renderer.locationWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'client_longitude'
            }, {
                text: 'Server Country'.t() ,
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'server_country',
            }, {
                text: 'Server Latitude'.t() ,
                width: Renderer.locationWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'server_latitude'
            }, {
                text: 'Server Longitude'.t() ,
                width: Renderer.locationWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'server_longitude'
            }, {
                text: 'Username'.t(),
                width: Renderer.usernameWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'username'
            }, {
                text: 'Hostname'.t(),
                width: Renderer.hostnameWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'hostname'
            }, {
                text: 'Client'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'c_client_addr'
            }, {
                text: 'Client Port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                dataIndex: 'c_client_port',
                filter: Renderer.numericFilter
            }, {
                text: 'New Client'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 's_client_addr'
            }, {
                text: 'New Client Port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                dataIndex: 's_client_port',
                filter: Renderer.numericFilter
            }, {
                text: 'Original Server'.t() ,
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'c_server_addr'
            }, {
                text: 'Original Server Port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                dataIndex: 'c_server_port',
                filter: Renderer.numericFilter
            }, {
                text: 'Server'.t() ,
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 's_server_addr'
            }, {
                text: 'Server Port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                dataIndex: 's_server_port',
                filter: Renderer.numericFilter
            }, {
                text: 'Tags'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'tags'
            }, {
                text: 'Filter Prefix'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'filter_prefix'
            }, {
                text: 'Rule Id'.t() + ' (Application Control)',
                width: Renderer.idWidth,
                sortable: true,
                dataIndex: 'application_control_ruleid',
                filter: Renderer.numericFilter
            }, {
                text: 'Priority'.t() + ' (Bandwidth Control)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'bandwidth_control_priority',
                rtype: 'priority'
            }, {
                text: 'Rule'.t() + ' (Bandwidth Control)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'bandwidth_control_rule'
            }, {
                text: 'Application'.t() + ' (Application Control)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'application_control_application'
            }, {
                text: 'ProtoChain'.t() + ' (Application Control)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'application_control_protochain'
            }, {
                text: 'Category'.t() + ' (Application Control)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'application_control_category'
            }, {
                text: 'Blocked'.t() + ' (Application Control)',
                width: Renderer.booleanWidth,
                sortable: true,
                dataIndex: 'application_control_blocked',
                filter: Renderer.booleanFilter
            }, {
                text: 'Flagged'.t() + ' (Application Control)',
                width: Renderer.booleanWidth,
                sortable: true,
                dataIndex: 'application_control_flagged',
                filter: Renderer.booleanFilter
            }, {
                text: 'Confidence'.t() + ' (Application Control)',
                width: Renderer.portWidth,
                sortable: true,
                dataIndex: 'application_control_confidence',
                filter: Renderer.numericFilter
            }, {
                text: 'Detail'.t() + ' (Application Control)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'application_control_detail'
            },{
                text: 'Protocol'.t() + ' (Application Control Lite)',
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'application_control_lite_protocol',
                rtype: 'protocol'
            }, {
                text: 'Blocked'.t() + ' (Application Control Lite)',
                width: Renderer.booleanWidth,
                sortable: true,
                dataIndex: 'application_control_lite_blocked',
                filter: Renderer.booleanFilter
            }, {
                text: 'Rule Id'.t() + ' (SSL Inspector)',
                width: Renderer.idWidth,
                sortable: true,
                dataIndex: 'ssl_inspector_ruleid',
                filter: Renderer.numericFilter
            }, {
                text: 'Status'.t() + ' (SSL Inspector)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'ssl_inspector_status'
            }, {
                text: 'Detail'.t() + ' (SSL Inspector)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'ssl_inspector_detail'
            }, {
                text: 'Blocked'.t() + ' (Firewall)',
                width: Renderer.booleanWidth,
                sortable: true,
                dataIndex: 'firewall_blocked',
                filter: Renderer.booleanFilter
            }, {
                text: 'Flagged'.t() + ' (Firewall)',
                width: Renderer.booleanWidth,
                sortable: true,
                dataIndex: 'firewall_flagged',
                filter: Renderer.booleanFilter
            }, {
                text: 'Rule Id'.t() + ' (Firewall)',
                width: Renderer.idWidth,
                sortable: true,
                flex:1,
                dataIndex: 'firewall_rule_index',
                filter: Renderer.numericFilter
            }, {
                text: 'Captured'.t() + ' (Captive Portal)',
                width: Renderer.messageWidth,
                sortable: true,
                dataIndex: 'captive_portal_blocked',
                filter: Renderer.booleanFilter
            }, {
                text: 'Rule Id'.t() + ' (Captive Portal)',
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'captive_portal_rule_index'
            }, {
                text: 'From-Server Bytes'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                dataIndex: 's2c_bytes',
                rtype: 'datasize',
                filter: Renderer.numericFilter
            }, {
                text: 'From-Client Bytes'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                dataIndex: 'c2s_bytes',
                rtype: 'datasize',
                filter: Renderer.numericFilter
            }]
        },
        http_events: {
            fields: [{
                name: 'request_id',
                sortType: 'asInt'
            }, {
                name: 'policy_id',
                convert: Converter.policy
            }, {
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'session_id',
                sortType: 'asInt'
            }, {
                name: 'client_intf',
                convert: Converter.interface
            }, {
                name: 'server_intf',
                convert: Converter.interface
            }, {
                name: 'c_client_addr',
                sortType: 'asIp'
            }, {
                name: 'c_client_port',
                sortType: 'asInt'
            }, {
                name: 'c_server_addr',
                sortType: 'asIp'
            }, {
                name: 'c_server_port',
                sortType: 'asInt'
            }, {
                name: 's_client_addr',
                sortType: 'asIp'
            }, {
                name: 's_client_port',
                sortType: 'asInt'
            }, {
                name: 's_server_addr',
                sortType: 'asIp'
            }, {
                name: 's_server_port',
                sortType: 'asInt'
            }, {
                name: 'username',
                type: 'string'
            }, {
                name: 'hostname',
                type: 'string'
            }, {
                name: 'method',
                type: 'string'
            }, {
                name: 'domain',
                type: 'string'
            }, {
                name: 'host',
                type: 'string'
            }, {
                name: 'uri',
                type: 'string'
            }, {
                name: 'referer',
                type: 'string'
            }, {
                name: 'c2s_content_length',
                sortType: 'asInt'
            }, {
                name: 's2c_content_length',
                sortType: 'asInt'
            }, {
                name: 's2c_content_type'
            }, {
                name: 's2c_content_filename'
            }, {
                name: 'web_filter_blocked'
            }, {
                name: 'web_filter_flagged'
            }, {
                name: 'web_filter_category',
                type: 'string'
            }, {
                name: 'web_filter_reason',
                type: 'string',
                convert: Converter.httpReason
            }, {
                name: 'ad_blocker_action',
                type: 'string',
                convert: Converter.adBlockerAction
            }, {
                name: 'ad_blocker_cookie_ident',
                type: 'string'
            }, {
                name: 'virus_blocker_clean'
            }, {
                name: 'virus_blocker_name',
                type: 'string'
            }, {
                name: 'virus_blocker_lite_clean'
            }, {
                name: 'virus_blocker_lite_name',
                type: 'string'
            }],
            columns: [{
                text: 'Request Id'.t(),
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'request_id'
            }, {
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Policy Id'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'policy_id'
            }, {
                text: 'Session Id'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'session_id'
            }, {
                text: 'Client Interface'.t() ,
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'client_intf'
            }, {
                text: 'Server Interface'.t() ,
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'server_intf'
            }, {
                text: 'Client'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'c_client_addr'
            }, {
                text: 'Client Port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'c_client_port'
            }, {
                text: 'New Client'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 's_client_addr'
            }, {
                text: 'New Client Port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 's_client_port'
            }, {
                text: 'Original Server'.t() ,
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'c_server_addr'
            }, {
                text: 'Original Server Port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'c_server_port'
            }, {
                text: 'Server'.t() ,
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 's_server_addr'
            }, {
                text: 'Server Port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 's_server_port'
            }, {
                text: 'Username'.t(),
                width: Renderer.usernameWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'username'
            }, {
                text: 'Hostname'.t(),
                width: Renderer.hostnameWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'hostname'
            }, {
                text: 'Domain'.t(),
                width: Renderer.hostnameWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'domain'
            }, {
                text: 'Host'.t(),
                width: Renderer.hostnameWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'host'
            }, {
                text: 'Uri'.t(),
                flex:1,
                width: Renderer.uriWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'uri'
            }, {
                text: 'Method'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'method',
                renderer: function(value) {
                    // untranslated because these are HTTP methods
                    switch ( value ) {
                    case 'O': return 'OPTIONS' + ' (O)';
                    case 'G': return 'GET' + ' (G)';
                    case 'H': return 'HEAD' + ' (H)';
                    case 'P': return 'POST' + ' (P)';
                    case 'U': return 'PUT' + ' (U)';
                    case 'D': return 'DELETE' + ' (D)';
                    case 'T': return 'TRACE' + ' (T)';
                    case 'C': return 'CONNECT' + ' (C)';
                    case 'X': return 'NON-STANDARD' + ' (X)';
                    default: return value;
                    }
                }
            }, {
                text: 'Referer'.t(),
                width: Renderer.uriWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'referer'
            }, {
                text: 'Download Content Length'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 's2c_content_length'
            }, {
                text: 'Upload Content Length'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'c2s_content_length'
            }, {
                text: 'Content Type'.t(),
                width: Renderer.messageWidth,
                flex: 1,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 's2c_content_type'
            }, {
                text: 'Content Filename'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 's2c_content_filename'
            }, {
                text: 'Blocked'.t() + ' (Web Filter)',
                width: Renderer.booleanWidth,
                sortable: true,
                dataIndex: 'web_filter_blocked',
                filter: Renderer.booleanFilter
            }, {
                text: 'Flagged'.t() + ' (Web Filter)',
                width: Renderer.booleanWidth,
                sortable: true,
                dataIndex: 'web_filter_flagged',
                filter: Renderer.booleanFilter
            }, {
                text: 'Reason For Action'.t() +  ' (Web Filter)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'web_filter_reason'
            }, {
                text: 'Web Category'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'web_filter_category'
            }, {
                text: 'Action'.t() + ' (Ad Blocker)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'ad_blocker_action'
            }, {
                text: 'Blocked Cookie'.t() + ' (Ad Blocker)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'ad_blocker_cookie_ident'
            }, {
                text: 'Clean'.t() + ' (Virus Blocker Lite)',
                width: Renderer.booleanWidth,
                sortable: true,
                dataIndex: 'virus_blocker_lite_clean',
                filter: Renderer.booleanFilter
            }, {
                text: 'Virus Name'.t() + ' (Virus Blocker Lite)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'virus_blocker_lite_name'
            }, {
                text: 'Clean'.t() + ' (Virus Blocker)',
                width: Renderer.booleanWidth,
                sortable: true,
                dataIndex: 'virus_blocker_clean',
                filter: Renderer.booleanFilter
            }, {
                text: 'Virus Name'.t() + ' (Virus Blocker)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'virus_blocker_name'
            }]
        },
        http_query_events: {
            fields: [{
                name: 'event_id'
            }, {
                name: 'session_id'
            }, {
                name: 'policy_id',
                convert: Converter.policy
            }, {
                name: 'request_id'
            }, {
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'client_intf',
                convert: Converter.interface
            }, {
                name: 'server_intf',
                convert: Converter.interface
            }, {
                name: 'c_client_addr',
                sortType: 'asIp'
            }, {
                name: 'c_client_port',
                sortType: 'asInt'
            }, {
                name: 'c_server_addr',
                sortType: 'asIp'
            }, {
                name: 'c_server_port',
                sortType: 'asInt'
            }, {
                name: 's_client_addr',
                sortType: 'asIp'
            }, {
                name: 's_client_port',
                sortType: 'asInt'
            }, {
                name: 's_server_addr',
                sortType: 'asIp'
            }, {
                name: 's_server_port',
                sortType: 'asInt'
            }, {
                name: 'username',
                type: 'string'
            }, {
                name: 'hostname',
                type: 'string'
            }, {
                name: 'c_server_addr',
                sortType: 'asIp'
            }, {
                name: 's_server_port',
                sortType: 'asInt'
            }, {
                name: 'host',
                type: 'string'
            }, {
                name: 'uri',
                type: 'string'
            }, {
                name: 'method',
                type: 'string'
            }, {
                name: 'c2s_content_length',
                sortType: 'asInt'
            }, {
                name: 's2c_content_length',
                sortType: 'asInt'
            }, {
                name: 's2c_content_type',
                type: 'string'
            }, {
                name: 'term'
            }],
            columns: [{
                text: 'Event Id'.t(),
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'event_id'
            }, {
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Policy Id'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'policy_id'
            }, {
                text: 'Request Id'.t(),
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'request_id'
            }, {
                text: 'Session Id'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'session_id'
            }, {
                text: 'Client Interface'.t() ,
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'client_intf'
            }, {
                text: 'Server Interface'.t() ,
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'server_intf'
            }, {
                text: 'Username'.t(),
                width: Renderer.usernameWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'username'
            }, {
                text: 'Hostname'.t(),
                width: Renderer.hostnameWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'hostname'
            }, {
                text: 'Client'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'c_client_addr'
            }, {
                text: 'Client Port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'c_client_port'
            }, {
                text: 'New Client'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 's_client_addr'
            }, {
                text: 'New Client Port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 's_client_port'
            }, {
                text: 'Original Server'.t() ,
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'c_server_addr'
            }, {
                text: 'Original Server Port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'c_server_port'
            }, {
                text: 'Server'.t() ,
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 's_server_addr'
            }, {
                text: 'Server Port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 's_server_port'
            }, {
                text: 'Host'.t(),
                width: Renderer.hostnameWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'host'
            }, {
                text: 'Uri'.t(),
                flex:1,
                width: Renderer.uriWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'uri'
            }, {
                text: 'Query Term'.t(),
                flex:1,
                width: Renderer.uriWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'term'
            }, {
                text: 'Method'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'method'
            }, {
                text: 'Download Content Length'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 's2c_content_length'
            }, {
                text: 'Upload Content Length'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'c2s_content_length'
            }, {
                text: 'Content Type'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 's2c_content_type'
            }, {
                text: 'Server'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'c_server_addr'
            }, {
                text: 'Server Port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 's_server_port'
            }]
        },
        mail_addrs: {
            fields: [{
                name: 'event_id'
            }, {
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'msg_id'
            }, {
                name: 'session_id'
            }, {
                name: 'policy_id',
                convert: Converter.policy
            }, {
                name: 'username'
            }, {
                name: 'hostname'
            }, {
                name: 'c_client_addr',
                sortType: 'asIp'
            }, {
                name: 'c_client_port',
                sortType: 'asInt'
            }, {
                name: 'c_server_addr',
                sortType: 'asIp'
            }, {
                name: 'c_server_port',
                sortType: 'asInt'
            }, {
                name: 's_client_addr',
                sortType: 'asIp'
            }, {
                name: 's_client_port',
                sortType: 'asInt'
            }, {
                name: 's_server_addr',
                sortType: 'asIp'
            }, {
                name: 's_server_port',
                sortType: 'asInt'
            }, {
                name: 'client_intf',
                convert: Converter.interface
            }, {
                name: 'server_intf',
                convert: Converter.interface
            }, {
                name: 'virus_blocker_name'
            }, {
                name: 'virus_blocker_clean'
            }, {
                name: 'virus_blocker_lite_name'
            }, {
                name: 'virus_blocker_lite_clean'
            }, {
                name: 'subject',
                type: 'string'
            }, {
                name: 'addr',
                type: 'string'
            }, {
                name: 'addr_name',
                type: 'string'
            }, {
                name: 'addr_kind',
                type: 'string'
            }, {
                name: 'sender',
                type: 'string'
            }, {
                name: 'vendor'
            }, {
                name:  'spam_blocker_lite_action',
                type: 'string',
                convert: Converter.emailAction
            }, {
                name: 'spam_blocker_lite_score',
                sortType: 'asFloat'
            }, {
                name: 'spam_blocker_lite_is_spam'
            }, {
                name: 'spam_blocker_lite_tests_string'
            }, {
                name:  'spam_blocker_action',
                type: 'string',
                convert: Converter.emailAction
            }, {
                name: 'spam_blocker_score',
                sortType: 'asFloat'
            }, {
                name: 'spam_blocker_is_spam'
            }, {
                name: 'spam_blocker_tests_string'
            }, {
                name:  'phish_blocker_action',
                type: 'string',
                convert: Converter.emailAction
            }, {
                name: 'phish_blocker_score',
                sortType: 'asFloat'
            }, {
                name: 'phish_blocker_is_spam'
            }, {
                name: 'phish_blocker_tests_string'
            }],
            columns: [{
                text: 'Event Id'.t(),
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'event_id'
            }, {
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Session Id'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'session_id'
            }, {
                text: 'Policy Id'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'policy_id'
            }, {
                text: 'Message Id'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'msg_id'
            }, {
                text: 'Client Interface'.t() ,
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'client_intf'
            }, {
                text: 'Server Interface'.t() ,
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'server_intf'
            }, {
                text: 'Username'.t(),
                width: Renderer.hostnameWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'username'
            }, {
                text: 'Hostname'.t(),
                width: Renderer.hostnameWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'hostname'
            }, {
                text: 'Client'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'c_client_addr'
            }, {
                text: 'Client Port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'c_client_port'
            }, {
                text: 'New Client'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 's_client_addr'
            }, {
                text: 'New Client Port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 's_client_port'
            }, {
                text: 'Original Server'.t() ,
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'c_server_addr'
            }, {
                text: 'Original Server Port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'c_server_port'
            }, {
                text: 'Server'.t() ,
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 's_server_addr'
            }, {
                text: 'Server Port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 's_server_port'
            }, {
                text: 'Receiver'.t(),
                width: Renderer.emailWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'addr'
            }, {
                text: 'Address Name'.t(),
                width: Renderer.emailWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'addr_name'
            }, {
                text: 'Address Kind'.t(),
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'addr_kind'
            }, {
                text: 'Sender'.t(),
                width: Renderer.emailWidth,
                flex:1,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'sender'
            }, {
                text: 'Subject'.t(),
                flex:1,
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'subject'
            }, {
                text: 'Name'.t() + ' (Virus Blocker Lite)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'virus_blocker_lite_name'
            }, {
                text: 'Clean'.t() + ' (Virus Blocker Lite)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'virus_blocker_lite_clean'
            }, {
                text: 'Name'.t() + ' (Virus Blocker)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'virus_blocker_name'
            }, {
                text: 'Clean'.t() + ' (Virus Blocker)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'virus_blocker_clean'
            }, {
                text: 'Action'.t() + ' (Spam Blocker Lite)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'spam_blocker_lite_action'
            }, {
                text: 'Spam Score'.t() + ' (Spam Blocker Lite)',
                width: Renderer.sizeWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'spam_blocker_lite_score'
            }, {
                text: 'Is Spam'.t() + ' (Spam Blocker Lite)',
                width: Renderer.booleanWidth,
                sortable: true,
                filter: Renderer.booleanFilter,
                dataIndex: 'spam_blocker_lite_is_spam'
            }, {
                text: 'Detail'.t() + ' (Spam Blocker Lite)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                flex: 1,
                dataIndex: 'spam_blocker_lite_tests_string'
            }, {
                text: 'Action'.t() + ' (Spam Blocker)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'spam_blocker_action'
            }, {
                text: 'Spam Score'.t() + ' (Spam Blocker)',
                width: Renderer.sizeWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'spam_blocker_score'
            }, {
                text: 'Is Spam'.t() + ' (Spam Blocker)',
                width: Renderer.booleanWidth,
                sortable: true,
                filter: Renderer.booleanFilter,
                dataIndex: 'spam_blocker_is_spam'
            }, {
                text: 'Detail'.t() + ' (Spam Blocker)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                flex: 1,
                dataIndex: 'spam_blocker_tests_string'
            }, {
                text: 'Action'.t() + ' (Phish Blocker)',
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'phish_blocker_action'
            }, {
                text: 'Score'.t() + ' (Phish Blocker)',
                width: Renderer.sizeWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'phish_blocker_score'
            }, {
                text: 'Is Phish'.t() + ' (Phish Blocker)',
                width: Renderer.booleanWidth,
                sortable: true,
                filter: Renderer.booleanFilter,
                dataIndex: 'phish_blocker_is_spam'
            }, {
                text: 'Detail'.t() + ' (Phish Blocker)',
                width: Renderer.messageWidth,
                flex: 1,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'phish_blocker_tests_string'
            }]
        },
        directory_connector_login_events: {
            fields: [{
                name: 'id'
            }, {
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'login_name'
            }, {
                name: 'domain'
            }, {
                name: 'type',
                convert: Converter.directoryConnectorAction
            }, {
                name: 'client_addr',
                sortType: 'asIp'
            }],
            columns: [{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Client'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'client_addr'
            }, {
                text: 'Username'.t(),
                width: Renderer.usernameWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'login_name'
            }, {
                text: 'Domain'.t(),
                width: Renderer.usernameWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'domain'
            }, {
                text: 'Action'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'type',
                flex: 1
            }]
        },
        admin_logins: {
            fields: [{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'login',
                type: 'string'
            }, {
                name: 'succeeded',
                type: 'string',
                convert: Converter.loginSuccess
            }, {
                name: 'local',
                type: 'string',
                convert: Converter.loginFrom
            }, {
                name: 'client_address',
                type: 'string'
            }, {
                name: 'reason',
                type: 'string',
                convert: Converter.loginFailureReason
            }],
            columns: [{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Login'.t(),
                width: Renderer.usernameWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'login'
            }, {
                text: 'Success'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'succeeded'
            }, {
                text: 'Local'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'local'
            }, {
                text: 'Client Address'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'client_addr'
            }, {
                text: 'Reason'.t(),
                flex: 1,
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'reason'
            }]
        },
        server_events: {
            fields: [{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'load_1',
                sortType: 'asFloat'
            }, {
                name: 'load_5',
                sortType: 'asFloat'
            }, {
                name: 'load_15',
                sortType: 'asFloat'
            }, {
                name: 'cpu_user',
                sortType: 'asFloat'
            }, {
                name: 'cpu_system',
                sortType: 'asFloat'
            }, {
                name: 'mem_total',
                sortType: 'asInt'
            }, {
                name: 'mem_free',
                sortType: 'asInt'
            }, {
                name: 'disk_total',
                sortType: 'asInt'
            }, {
                name: 'disk_free',
                sortType: 'asInt'
            }, {
                name: 'swap_total',
                sortType: 'asInt'
            }, {
                name: 'swap_free',
                sortType: 'asInt'
            }, {
                name: 'active_hosts',
                sortType: 'asInt'
            }],
            columns: [{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Load (1-minute)'.t(),
                width: Renderer.loadWidth,
                sortable: true,
                dataIndex: 'load_1',
                filter: Renderer.numericFilter
            }, {
                text: 'Load (5-minute)'.t(),
                width: Renderer.loadWidth,
                sortable: true,
                dataIndex: 'load_5',
                filter: Renderer.numericFilter
            }, {
                text: 'Load (15-minute)'.t(),
                width: Renderer.loadWidth,
                sortable: true,
                dataIndex: 'load_15',
                filter: Renderer.numericFilter
            }, {
                text: 'CPU User Utilization'.t(),
                width: Renderer.loadWidth,
                sortable: true,
                dataIndex: 'cpu_user',
                filter: Renderer.numericFilter
            }, {
                text: 'CPU System Utilization'.t(),
                width: Renderer.loadWidth,
                sortable: true,
                dataIndex: 'cpu_system',
                filter: Renderer.numericFilter
            }, {
                text: 'Memory Total'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                dataIndex: 'mem_total',
                filter: Renderer.numericFilter,
                renderer: function(value) {
                    var meg = value/1024/1024;
                    return (Math.round( meg*10 )/10).toString() + ' MB';
                }

            }, {
                text: 'Memory Free'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                dataIndex: 'mem_free',
                filter: Renderer.numericFilter,
                renderer: function(value) {
                    var meg = value/1024/1024;
                    return (Math.round( meg*10 )/10).toString() + ' MB';
                }
            }, {
                text: 'Disk Total'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                dataIndex: 'disk_total',
                filter: Renderer.numericFilter,
                renderer: function(value) {
                    var gig = value/1024/1024/1024;
                    return (Math.round( gig*10 )/10).toString() + ' GB';
                }
            }, {
                text: 'Disk Free'.t(),
                width: Renderer.sizeWidth,
                flex: 1,
                sortable: true,
                dataIndex: 'disk_free',
                filter: Renderer.numericFilter,
                renderer: function(value) {
                    var gig = value/1024/1024/1024;
                    return (Math.round( gig*10 )/10).toString() + ' GB';
                }
            }, {
                text: 'Swap Total'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                dataIndex: 'swap_total',
                filter: Renderer.numericFilter,
                renderer: function(value) {
                    var meg = value/1024/1024;
                    return (Math.round( meg*10 )/10).toString() + ' MB';
                }
            }, {
                text: 'Swap Free'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                dataIndex: 'swap_free',
                filter: Renderer.numericFilter,
                renderer: function(value) {
                    var meg = value/1024/1024;
                    return (Math.round( meg*10 )/10).toString() + ' MB';
                }
            }, {
                text: 'Active Hosts'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                dataIndex: 'active_hosts',
                filter: Renderer.numericFilter
            }]
        },
        host_table_updates: {
            fields: [{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'address',
                sortType: 'asIp'
            }, {
                name: 'key',
                type: 'string'
            }, {
                name: 'value',
                type: 'string'
            }, {
                name: 'old_value',
                type: 'string'
            }],
            columns: [{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Address'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'address'
            }, {
                text: 'Key'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'key'
            }, {
                text: 'Old Value'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'old_value'
            }, {
                text: 'Value'.t(),
                width: Renderer.messageWidth,
                flex: 1,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'value'
            }]
        },
        device_table_updates: {
            fields: [{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'mac_address',
                type: 'string'
            }, {
                name: 'key',
                type: 'string'
            }, {
                name: 'value',
                type: 'string'
            }, {
                name: 'old_value',
                type: 'string'
            }],
            columns: [{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'MAC Address'.t(),
                width: Renderer.macWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'mac_address'
            }, {
                text: 'Key'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'key'
            }, {
                text: 'Old Value'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'old_value'
            }, {
                text: 'Value'.t(),
                width: Renderer.messageWidth,
                flex: 1,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'value'
            }]
        },
        user_table_updates: {
            fields: [{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'username',
                type: 'string'
            }, {
                name: 'key',
                type: 'string'
            }, {
                name: 'value',
                type: 'string'
            }, {
                name: 'old_value',
                type: 'string'
            }],
            columns: [{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Username'.t(),
                width: Renderer.usernameWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'username'
            }, {
                text: 'Key'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'key'
            }, {
                text: 'Old Value'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'old_value'
            }, {
                text: 'Value'.t(),
                width: Renderer.messageWidth,
                flex: 1,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'value'
            }]
        },
        configuration_backup_events: {
            fields: [{
                name: 'event_id'
            }, {
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'success',
                type: 'string',
                convert: Converter.configurationBackupSuccess
            }, {
                name: 'description',
                type: 'string'
            }, {
                name: 'destination',
                type: 'string'
            }],
            columns: [{
                text: 'Event Id'.t(),
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'event_id'
            },{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Result'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'success'
            }, {
                text: 'Destination'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'destination'
            }, {
                text: 'Details'.t(),
                flex:1,
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'description'
            }]
        },
        wan_failover_test_events: {
            fields: [{
                name: 'event_id'
            },{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            },{
                name: 'interface_id'
            },{
                name: 'name'
            },{
                name: 'success'
            },{
                name: 'description'
            }],
            columns: [{
                text: 'Event Id'.t(),
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'event_id'
            },{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            },{
                text: 'Interface Name'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'name'
            },{
                text: 'Interface Id'.t(),
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'interface_id',
                rtype: 'interface'
            },{
                text: 'Success'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                dataIndex: 'success',
                filter: Renderer.booleanFilter
            },{
                text: 'Test Description'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'description',
                flex:1
            }]
        },
        wan_failover_action_events: {
            fields: [{
                name: 'event_id'
            },{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            },{
                name: 'interface_id'
            },{
                name: 'name'
            },{
                name: 'os_name'
            },{
                name: 'action'
            }],
            columns: [{
                text: 'Event Id'.t(),
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'event_id'
            },{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            },{
                text: 'Interface Name'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'name'
            },{
                text: 'Interface Id'.t(),
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'interface_id',
                rtype: 'interface'
            },{
                text: 'Interface OS'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'os_name'
            },{
                text: 'Action'.t(),
                width: Renderer.messageWidth,
                filter: Renderer.stringFilter,
                flex: 1,
                sortable: true,
                dataIndex: 'action'
            }]
        },
        ipsec_user_events: {
            fields: [{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            },{
                name: 'event_id'
            },{
                name: 'client_username'
            },{
                name: 'client_protocol'
            },{
                name: 'connect_stamp',
                sortType: 'asTimestamp'
            },{
                name: 'goodbye_stamp',
                sortType: 'asTimestamp'
            },{
                name: 'elapsed_time'
            },{
                name: 'client_address',
                sortType: 'asIp'
            },{
                name: 'net_interface'
            },{
                name: 'net_process'
            },{
                name: 'rx_bytes',
                sortType: 'asInt'
            },{
                name: 'tx_bytes',
                sortType: 'asInt'
            }],
            columns: [{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            },{
                text: 'Event Id'.t(),
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'event_id'
            },{
                text: 'Address'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'client_address'
            },{
                text: 'Username'.t(),
                width: Renderer.usernameWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'client_username'
            },{
                text: 'Protocol'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'client_protocol',
                // rtype: 'protocol',
            },{
                text: 'Login Time'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'connect_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            },{
                text: 'Logout Time'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'goodbye_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            },{
                text: 'Elapsed'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'elapsed_time'
            },{
                text: 'Interface'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'net_interface',
                rtype: 'interface'
            },{
                text: 'RX Bytes'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'rx_bytes',
                rtype: 'datasize'
            },{
                text: 'TX Bytes'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                dataIndex: 'tx_bytes',
                filter: Renderer.numericFilter,
                rtype: 'datasize'
            },{
                text: 'Process'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'net_process'
            }]
        },
        ipsec_vpn_events: {
            fields: [{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'type'
            }, {
                name: 'tunnel_description',
                type: 'string'
            }, {
                name: 'remote_address',
                type: 'string',
                sortType: 'asIp'
            }, {
                name: 'local_address',
                type: 'string',
                sortType: 'asIp'
            }],
            columns: [{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Type'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'event_type'
            }, {
                text: 'Tunnel Description'.t(),
                width: Renderer.usernameWidth,
                sortable: true,
                flex: 1,
                filter: Renderer.stringFilter,
                dataIndex: 'tunnel_description'
            }, {
                text: 'Remote Address'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'remote_address'
            }, {
                text: 'Local Address'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'local_address'
            }]
        },
        ipsec_tunnel_stats: {
            fields: [{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'in_bytes',
                sortType: 'asInt'
            }, {
                name: 'out_bytes',
                sortType: 'asInt'
            }, {
                name: 'tunnel_name',
                type: 'string'
            }, {
                name: 'event_id',
                sortType: 'asInt'
            }],
            columns: [{
                text: 'Event Id'.t(),
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'event_id'
            }, {
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Tunnel Name'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                flex: 1,
                filter: Renderer.stringFilter,
                dataIndex: 'tunnel_name'
            }, {
                text: 'In Bytes'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'in_bytes',
                rtype: 'datasize'
            }, {
                text: 'Out Bytes'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'out_bytes',
                rtype: 'datasize'
            }]
        },
        tunnel_vpn_events: {
            fields: [{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'type'
            }, {
                name: 'tunnel_name',
                type: 'string'
            }, {
                name: 'server_address',
                sortType: 'asIp'
            }, {
                name: 'local_address',
                sortType: 'asIp'
            }],
            columns: [{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Type'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'event_type'
            }, {
                text: 'Tunnel Name'.t(),
                width: Renderer.usernameWidth,
                sortable: true,
                flex: 1,
                filter: Renderer.stringFilter,
                dataIndex: 'tunnel_name'
            }, {
                text: 'Server Address'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'server_address'
            }, {
                text: 'Local Address'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'local_address'
            }]
        },
        tunnel_vpn_stats: {
            fields: [{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'in_bytes',
                sortType: 'asInt'
            }, {
                name: 'out_bytes',
                sortType: 'asInt'
            }, {
                name: 'tunnel_name',
                type: 'string'
            }, {
                name: 'event_id',
                sortType: 'asInt'
            }],
            columns: [{
                text: 'Event Id'.t(),
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'event_id'
            }, {
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Tunnel Name'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                flex: 1,
                filter: Renderer.stringFilter,
                dataIndex: 'tunnel_name'
            }, {
                text: 'In Bytes'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'in_bytes',
                rtype: 'datasize'
            }, {
                text: 'Out Bytes'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'out_bytes',
                rtype: 'datasize'
            }]
        },
        interface_stat_events: {
            fields: [{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'interface_id',
                sortType: 'asInt'
            }, {
                name: 'rx_rate'
            }, {
                name: 'tx_rate'
            }],
            columns: [{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            },{
                text: 'Interface Id'.t(),
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'interface_id',
                rtype: 'interface'
            }, {
                text: 'RX Rate'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                dataIndex: 'rx_rate',
                filter: Renderer.numericFilter
            }, {
                text: 'TX Rate'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                dataIndex: 'tx_rate',
                filter: Renderer.numericFilter
            }]
        },
        smtp_tarpit_events: {
            fields: [{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'policy_id',
                convert: Converter.policy
            }, {
                name: 'event_id'
            }, {
                name: 'vendor_name'
            }, {
                name: 'ipaddr',
                convert: function(value) {
                    return value === null ? '': value;
                }
            }, {
                name: 'hostname'
            }],
            columns: [{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Policy Id'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'policy_id'
            }, {
                text: 'Event Id'.t(),
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'event_id'
            }, {
                text: 'Vendor Name'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'vendor_name'
            }, {
                text: 'Sender'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'ipaddr'
            }, {
                text: 'DNSBL Server'.t(),
                width: Renderer.messageWidth,
                flex: 1,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'hostname'
            }]
        },
        web_cache_stats: {
            fields: [{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'event_id'
            }, {
                name: 'hits'
            }, {
                name: 'misses'
            }, {
                name: 'bypasses'
            }, {
                name: 'systems'
            }, {
                name: 'hit_bytes',
                sortType: 'asInt'
            }, {
                name: 'miss_bytes',
                sortType: 'asInt'
            }],
            columns: [{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Event Id'.t(),
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'event_id'
            }, {
                text: 'Hit Count'.t(),
                width: Renderer.counterWidth,
                sortable: false,
                dataIndex: 'hits',
                filter: Renderer.numericFilter
            }, {
                text: 'Miss Count'.t(),
                width: Renderer.counterWidth,
                sortable: false,
                dataIndex: 'misses',
                filter: Renderer.numericFilter
            }, {
                text: 'Bypass Count'.t(),
                width: Renderer.counterWidth,
                sortable: false,
                dataIndex: 'bypasses',
                filter: Renderer.numericFilter
            }, {
                text: 'System Count'.t(),
                width: Renderer.counterWidth,
                sortable: false,
                dataIndex: 'systems',
                filter: Renderer.numericFilter
            }, {
                text: 'Hit Bytes'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                dataIndex: 'hit_bytes',
                filter: Renderer.numericFilter,
                rtype: 'datasize'
            }, {
                text: 'Miss Bytes'.t(),
                width: Renderer.sizeWidth,
                flex: 1,
                sortable: true,
                dataIndex: 'miss_bytes',
                filter: Renderer.numericFilter,
                rtype: 'datasize'
            }]
        },
        captive_portal_user_events: {
            fields: [{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'policy_id',
                convert: Converter.policy
            }, {
                name: 'event_id'
            },{
                name: 'client_addr',
                sortType: 'asIp'
            },{
                name: 'login_name'
            },{
                name: 'auth_type',
                convert: Converter.authType
            },{
                name: 'event_info',
                convert: Converter.captivePortalEventInfo
            }],
            columns: [{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Policy Id'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'policy_id'
            }, {
                text: 'Event Id'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'event_id'
            }, {
                text: 'Client'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'client_addr'
            }, {
                text: 'Username'.t(),
                width: Renderer.usernameWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'login_name'
            }, {
                text: 'Action'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'event_info'
            }, {
                text: 'Authentication'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'auth_type',
                flex: 1
            }]
        },
        intrusion_prevention_events: {
            fields: [{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'sig_id',
                sortType: 'asInt'
            }, {
                name: 'gen_id',
                sortType: 'asInt'
            }, {
                name: 'class_id',
                sortType: 'asInt'
            }, {
                name: 'source_addr',
                sortType: 'asIp'
            }, {
                name: 'source_port',
                sortType: 'asInt'
            }, {
                name: 'dest_addr',
                sortType: 'asIp'
            }, {
                name: 'dest_port',
                sortType: 'asInt'
            }, {
                name: 'protocol',
                convert: Converter.protocol
            }, {
                name: 'blocked'
            }, {
                name: 'category',
                type: 'string'
            }, {
                name: 'classtype',
                type: 'string'
            }, {
                name: 'msg',
                type: 'string'
            }],
            columns: [{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Sid'.t(),
                width: Renderer.portWidth,
                sortable: true,
                dataIndex: 'sig_id',
                filter: Renderer.numericFilter
            }, {
                text: 'Gid'.t(),
                width: Renderer.portWidth,
                sortable: true,
                dataIndex: 'gen_id',
                filter: Renderer.numericFilter
            }, {
                text: 'Cid'.t(),
                width: Renderer.portWidth,
                sortable: true,
                dataIndex: 'class_id',
                filter: Renderer.numericFilter
            }, {
                text: 'Source Address'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'source_addr'
            }, {
                text: 'Source port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                dataIndex: 'source_port',
                filter: Renderer.numericFilter
            }, {
                text: 'Destination Address'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'dest_addr'
            }, {
                text: 'Destination port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                dataIndex: 'dest_port',
                filter: Renderer.numericFilter
            }, {
                text: 'Protocol'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'protocol'
            }, {
                text: 'Blocked'.t(),
                width: Renderer.booleanWidth,
                sortable: true,
                dataIndex: 'blocked',
                filter: Renderer.booleanFilter
            }, {
                text: 'Category'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'category'
            }, {
                text: 'Classtype'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'classtype'
            }, {
                text: 'Msg'.t(),
                width: Renderer.messageWidth,
                flex: 1,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'msg'
            }]
        },
        openvpn_events: {
            fields: [{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'type'
            }, {
                name: 'client_name',
                type: 'string'
            }, {
                name: 'remote_address',
                sortType: 'asIp'
            }, {
                name: 'pool_address',
                sortType: 'asIp'
            }],
            columns: [{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Type'.t(),
                width: Renderer.messageWidth,
                flex: 1,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'type'
            }, {
                text: 'Client Name'.t(),
                width: Renderer.usernameWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'client_name'
            }, {
                text: 'Client Address'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'remote_address'
            }, {
                text: 'Pool Address'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'pool_address'
            }]
        },
        openvpn_stats: {
            fields: [{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'start_time',
                sortType: 'asTimestamp'
            }, {
                name: 'end_time',
                sortType: 'asTimestamp'
            }, {
                name: 'rx_bytes',
                sortType: 'asInt'
            }, {
                name: 'tx_bytes',
                sortType: 'asInt'
            }, {
                name: 'remote_address',
                sortType: 'asIp'
            }, {
                name: 'pool_address',
                sortType: 'asIp'
            }, {
                name: 'remote_port',
                sortType: 'asInt'
            }, {
                name: 'client_name',
                type: 'string'
            }, {
                name: 'event_id',
                sortType: 'asInt'
            }],
            columns: [{
                text: 'Event Id'.t(),
                width: Renderer.idWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'event_id'
            }, {
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Start Time'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'start_time',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'End Time'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'end_time',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Client Name'.t(),
                width: Renderer.usernameWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'client_name'
            }, {
                text: 'Client Address'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'remote_address'
            }, {
                text: 'Client Port'.t(),
                width: Renderer.portWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'remote_port'
            }, {
                text: 'Pool Address'.t(),
                width: Renderer.ipWidth,
                sortable: true,
                filter: Renderer.stringFilter,
                dataIndex: 'pool_address'
            }, {
                text: 'RX Bytes'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'rx_bytes',
                rtype: 'datasize',
            }, {
                text: 'TX Bytes'.t(),
                width: Renderer.sizeWidth,
                flex: 1,
                sortable: true,
                filter: Renderer.numericFilter,
                dataIndex: 'tx_bytes',
                rtype: 'datasize',
            }]
        },
        alerts: {
            fields: [{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            },{
                name: 'description'
            },{
                name: 'summary_text'
            },{
                name: 'json'
            }],
            columns: [{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            },{
                text: 'Description'.t(),
                width: Renderer.messageWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                dataIndex: 'description'
            },{
                text: 'Summary Text'.t(),
                sortable: true,
                width: Renderer.messageWidth,
                filter: Renderer.stringFilter,
                dataIndex: 'summary_text'
            },{
                text: 'JSON'.t(),
                flex: 1,
                width: Renderer.messageWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                dataIndex: 'json'
            }]
        },
        syslog: {
            fields: [{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            },{
                name: 'description'
            },{
                name: 'summary_text'
            },{
                name: 'json'
            }],
            columns: [{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            },{
                text: 'Description'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                dataIndex: 'description'
            },{
                text: 'Summary Text'.t(),
                width: Renderer.messageWidth,
                sortable: true,
                dataIndex: 'summary_text'
            },{
                text: 'JSON'.t(),
                flex: 1,
                width: Renderer.messageWidth,
                sortable: true,
                dataIndex: 'json'
            }]
        },
        ftp_events: {
            fields: [{
                name: 'event_id'
            }, {
                name: 'request_id'
            }, {
                name: 'session_id'
            }, {
                name: 'policy_id',
                convert: Converter.policy
            }, {
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'method'
            }, {
                name: 'c_client_addr',
                sortType: 'asIp'
            }, {
                name: 'c_server_addr',
                sortType: 'asIp'
            }, {
                name: 's_client_addr',
                sortType: 'asIp'
            }, {
                name: 's_server_addr',
                sortType: 'asIp'
            }, {
                name: 'hostname'
            }, {
                name: 'username'
            }, {
                name: 'client_intf',
                convert: Converter.interface
            }, {
                name: 'server_intf',
                convert: Converter.interface
            }, {
                name: 'uri'
            }, {
                name: 'location'
            }, {
                name: 'virus_blocker_lite_name'
            }, {
                name: 'virus_blocker_lite_clean'
            }, {
                name: 'virus_blocker_name'
            }, {
                name: 'virus_blocker_clean'
            }],
            columns: [{
                text: 'Event Id'.t(),
                width: Renderer.idWidth,
                filter: Renderer.numericFilter,
                sortable: true,
                dataIndex: 'event_id'
            }, {
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Policy Id'.t(),
                width: Renderer.messageWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                dataIndex: 'policy_id'
            }, {
                text: 'Session Id'.t(),
                width: Renderer.messageWidth,
                filter: Renderer.numericFilter,
                sortable: true,
                dataIndex: 'session_id'
            }, {
                text: 'Request Id'.t(),
                width: Renderer.portWidth,
                filter: Renderer.numericFilter,
                sortable: true,
                dataIndex: 'request_id'
            }, {
                text: 'Method'.t(),
                width: Renderer.portWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                dataIndex: 'method'
            }, {
                text: 'Client Interface'.t() ,
                width: Renderer.portWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                dataIndex: 'client_intf'
            }, {
                text: 'Server Interface'.t() ,
                width: Renderer.portWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                dataIndex: 'server_intf'
            }, {
                text: 'Client'.t(),
                width: Renderer.ipWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                dataIndex: 'c_client_addr'
            }, {
                text: 'New Client'.t(),
                width: Renderer.ipWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                dataIndex: 's_client_addr'
            }, {
                text: 'Original Server'.t() ,
                width: Renderer.ipWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                dataIndex: 'c_server_addr'
            }, {
                text: 'Server'.t() ,
                width: Renderer.ipWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                dataIndex: 's_server_addr'
            }, {
                text: 'Hostname'.t(),
                width: Renderer.hostnameWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                dataIndex: 'hostname'
            }, {
                text: 'Username'.t(),
                width: Renderer.usernameWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                dataIndex: 'username'
            }, {
                text: 'File Name'.t(),
                flex:1,
                width: Renderer.uriWidth,
                filter: Renderer.stringFilter,
                dataIndex: 'uri'
            }, {
                text: 'Virus Blocker Lite ' + 'Name'.t(),
                width: Renderer.messageWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                dataIndex: 'virus_blocker_lite_name'
            }, {
                text: 'Virus Blocker Lite ' + 'clean'.t(),
                width: Renderer.messageWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                dataIndex: 'virus_blocker_lite_clean'
            }, {
                text: 'Virus Blocker ' + 'Name'.t(),
                width: Renderer.messageWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                dataIndex: 'virus_blocker_name'
            }, {
                text: 'Virus Blocker ' + 'Clean'.t(),
                width: Renderer.messageWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                dataIndex: 'virus_blocker_clean'
            }, {
                text: 'Server'.t(),
                width: Renderer.ipWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                dataIndex: 'c_server_addr'
            }]
        },
        quotas: {
            fields: [{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'address',
                sortType: 'asIp'
            }, {
                name: 'action',
                convert: Converter.quotaAction
            }, {
                name: 'size',
                sortType: 'asInt'
            }, {
                name: 'reason'
            }],
            columns: [{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Address'.t(),
                width: Renderer.ipWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                dataIndex: 'address'
            }, {
                text: 'Action'.t(),
                width: Renderer.messageWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                dataIndex: 'action'
            }, {
                text: 'Size'.t(),
                width: Renderer.sizeWidth,
                sortable: true,
                dataIndex: 'size',
                filter: Renderer.numericFilter,
                rtype: 'datasize'
            }, {
                text: 'Reason'.t(),
                width: Renderer.messageWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                flex: 1,
                dataIndex: 'reason'
            }]
        },
        settings_changes: {
            fields: [{
                name: 'time_stamp',
                sortType: 'asTimestamp'
            }, {
                name: 'username',
                type: 'string'
            }, {
                name: 'hostname',
                type: 'string'
            }, {
                name: 'settings_file',
                type: 'string'
            }],
            columns: [{
                text: 'Timestamp'.t(),
                width: Renderer.timestampWidth,
                sortable: true,
                dataIndex: 'time_stamp',
                rtype: 'timestamp',
                filter: Renderer.timestampFilter
            }, {
                text: 'Username'.t(),
                width: Renderer.usernameWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                dataIndex: 'username'
            }, {
                text: 'Hostname'.t(),
                width: Renderer.hostnameWidth,
                filter: Renderer.stringFilter,
                sortable: true,
                dataIndex: 'hostname'
            }, {
                text: 'Settings File'.t(),
                flex:1,
                filter: Renderer.stringFilter,
                width: Renderer.uriWidth,
                dataIndex: 'settings_file',
                rtype: 'settingsFile'
            },{
                text: "Differences".t(),
                width: Renderer.actionWidth,
                xtype: 'actioncolumn',
                align: 'center',
                tdCls: 'action-cell',
                hideable: false,
                hidden: false,
                iconCls: 'fa fa-search fa-black',
                tooltip: "Show difference between previous version".t(),
                handler: function(view, rowIndex, colIndex, item, e, record) {
                    if( !this.diffWindow ) {
                        var columnRenderer = function(value, meta, record) {
                            var action = record.get("action");
                            if( action == 3){
                                meta.style = "background-color:#ffff99";
                            }else if(action == 2) {
                                meta.style = "background-color:#ffdfd9";
                            }else if(action == 1) {
                                meta.style = "background-color:#d9f5cb";
                            }
                            return value;
                        };
                        this.diffWindow = Ext.create('Ext.window.Window',{
                            name: 'diffWindow',
                            title: 'Settings Difference'.t(),
                            closeAction: 'hide',
                            width: Ext.getBody().getViewSize().width - 20,
                            height:Ext.getBody().getViewSize().height - 20,
                            layout: 'fit',
                            items: [{
                                xtype: 'ungrid',
                                name: 'gridDiffs',
                                initialLoad: function() {},
                                cls: 'diff-grid',
                                reload: function(handler) {
                                    this.getStore().getProxy().setData([]);
                                    this.getStore().load();
                                    rpc.settingsManager.getDiff(Ext.bind(function(result,exception) {
                                        var diffWindow = this.up("window[name=diffWindow]");
                                        if (diffWindow ==null || !diffWindow.isVisible()) {
                                            return;
                                        }
                                        if(exception) {
                                            this.getView().setLoading(false);
                                            Util.handleException(exception);
                                            return;
                                        }
                                        var diffData = [];
                                        var diffLines = result.split("\n");
                                        var action;
                                        for( var i = 0; i < diffLines.length; i++) {
                                            previousAction = diffLines[i].substr(0,1);
                                            previousLine = diffLines[i].substr(1,510);
                                            currentAction = diffLines[i].substr(511,1);
                                            currentLine = diffLines[i].substr(512);

                                            if( previousAction != "<" && previousAction != ">") {
                                                previousLine = previousAction + previousLine;
                                                previousAction = -1;
                                            }
                                            if( currentAction != "<" && currentAction != ">" && currentAction != "|"){
                                                currentLine = currentAction + currentLine;
                                                currentAction = -1;
                                            }

                                            if( currentAction == "|" ) {
                                                action = 3;
                                            } else if(currentAction == "<") {
                                                action = 2;
                                            } else if(currentAction == ">") {
                                                action = 1;
                                            } else {
                                                action = 0;
                                            }

                                            diffData.push({
                                                line: (i + 1),
                                                previous: previousLine.replace(/\s+$/,"").replace(/\s/g, "&nbsp;"),
                                                current: currentLine.replace(/\s+$/,"").replace(/\s/g, "&nbsp;"),
                                                action: action
                                            });
                                        }
                                        this.getStore().loadRawData(diffData);
                                    },this), this.fileName);
                                },
                                fields: [{
                                    name: "line"
                                }, {
                                    name: "previous"
                                }, {
                                    name: "current"
                                }, {
                                    name: "action"
                                }],
                                columnsDefaultSortable: false,
                                columns:[{
                                    text: "Line".t(),
                                    dataIndex: "line",
                                    renderer: columnRenderer
                                },{
                                    text: "Previous".t(),
                                    flex: 1,
                                    dataIndex: "previous",
                                    renderer: columnRenderer
                                },{
                                    text: "Current".t(),
                                    flex: 1,
                                    dataIndex: "current",
                                    renderer: columnRenderer
                                }]
                            }],
                            buttons: [{
                                text: "Close".t(),
                                handler: Ext.bind(function() {
                                    this.diffWindow.hide();
                                }, this)
                            }],
                            update: function(fileName) {
                                var grid = this.down("grid[name=gridDiffs]");
                                grid.fileName = fileName;
                                grid.reload();
                            },
                            doSize : function() {
                                this.maximize();
                            }
                        });
                        this.on("beforedestroy", Ext.bind(function() {
                            if(this.diffWindow) {
                                Ext.destroy(this.diffWindow);
                                this.diffWindow = null;
                            }
                        }, this));
                    }
                    this.diffWindow.show();
                    this.diffWindow.update(record.get("settings_file"));
                }
            }]
        }
    }
});
