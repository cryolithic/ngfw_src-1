Ext.define('Ung.config.network.view.FilterRules', {
    extend: 'Ung.cmp.MasterGrid',
    alias: 'widget.config-network-filter-rules',
    itemId: 'filter-rules',

    bind: '{filterRules}',

    title: 'Filter Rules'.t(),
    description: 'Filter Rules control what sessions are passed/blocked. Filter rules process all sessions including bypassed sessions. The rules are evaluated in order.'.t(),

    toolbarActions: ['ADD'],
    enableMove: true,
    enableDelete: true,

    settingsProperty: 'filterRules',
    conditionClass: 'com.untangle.uvm.network.FilterRuleCondition',
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

    emptyText: 'No Filter Rules defined'.t(),

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

    columnsDef: [
        Column.RULEID,
        Column.ENABLED,
        Column.DESCRIPTION,
        Column.CONDITIONS
    ]
});
