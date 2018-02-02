Ext.define('Ung.config.network.view.FilterRules', {
    extend: 'Ext.Panel',
    alias: 'widget.config-network-filter-rules',
    itemId: 'filter-rules',
    scrollable: true,

    viewModel: true,

    title: 'Filter Rules'.t(),

    layout: 'fit',

    items: [{
        xtype: 'mastergrid',
        flex: 3,

        enableMove: true,
        enableDelete: true,

        emptyText: 'No Filter Rules defined'.t(),
        settingsProperty: 'filterRules',
        conditions: [
            Condition.HOST_IN_PENALTY_BOX,
            Condition.DST_ADDR,
            Condition.DST_PORT,
            Condition.DST_INTF,
            Condition.SRC_ADDR,
            Condition.SRC_PORT,
            Condition.SRC_INTF,
            Condition.PROTOCOL,
            Condition.CLIENT_TAGGED,
            Condition.SERVER_TAGGED
        ],
        conditionClass: 'com.untangle.uvm.network.FilterRuleCondition',
        newRecord: {
            ruleId: -1,
            enabled: true,
            auto: true,
            javaClass: 'com.untangle.uvm.network.FilterRule',
            conditions: {
                javaClass: 'java.util.LinkedList',
                list: []
            },
            description: ''
        },

        plugins: {
            gridcellediting: true,
            gridviewoptions: false
        },

        // defaults: {
        //     menuDisabled: true
        // },

        sortable: false,

        bind: '{filterRules}',

        columnsDef: [
            Column.RULEID,
            Column.ENABLED,
            Column.DESCRIPTION,
            Column.CONDITIONS
        ]
    }, {
        xtype: 'paneldescription',
        html: 'Filter Rules control what sessions are passed/blocked. Filter rules process all sessions including bypassed sessions. The rules are evaluated in order.'.t()
    }]
});
