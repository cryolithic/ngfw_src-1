Ext.define('Ung.config.network.view.Services', {
    extend: 'Ung.cmp.MasterGrid',
    alias: 'widget.config-network-services',
    itemId: 'services',

    bind: {
        store: {
            // data: '{settings.bypassRules.list}',
            // model: 'Ung.model.BypassRules'
        }
    },


    // title: 'Bypass Rules'.t(),
    description: 'Services'.t(),

    toolbarActions: ['ADD'],
    enableMove: true,
    enableDelete: true,

    settingsProperty: 'bypassRules',
    conditionClass: 'com.untangle.uvm.network.BypassRuleCondition',
    conditions: [
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

    emptyText: 'No Bypass Rules defined'.t(),

    newRecord: {
        ruleId: -1,
        enabled: true,
        bypass: true,
        javaClass: 'com.untangle.uvm.network.BypassRule',
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
        Column.CONDITIONS,
        Column.BYPASS
    ]
});
