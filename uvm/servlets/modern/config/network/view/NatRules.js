Ext.define('Ung.config.network.view.NatRules', {
    extend: 'Ung.cmp.MasterGrid',
    alias: 'widget.config-network-nat-rules',
    itemId: 'nat-rules',

    bind: {
        store: {
            data: '{settings.natRules.list}',
            model: 'NatRules'
        }
    },

    title: 'NAT Rules'.t(),
    description: 'NAT Rules control the rewriting of the IP source address of traffic (Network Address Translation). The rules are evaluated in order.'.t(),

    toolbarActions: ['ADD'],
    enableMove: true,
    enableDelete: true,

    settingsProperty: 'natRules',
    conditionClass: 'com.untangle.uvm.network.NatRuleCondition',
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

    emptyText: 'No NAT Rules defined'.t(),

    newRecord: {
        ruleId: -1,
        enabled: true,
        auto: true,
        javaClass: 'com.untangle.uvm.network.NatRule',
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
        Column.NAT_TYPE, {
            xtype: 'gridcolumn',
            text: 'New Source'.t(),
            dataIndex: 'newSource',
            width: 150,
            editable: true,
            editor: {
                xtype: 'textfield'
            }
        }]
});
