Ext.define('Ung.config.network.view.BypassRules', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.config-network-bypass-rules',
    itemId: 'bypass-rules',
    viewModel: true,
    scrollable: true,

    title: 'Bypass Rules'.t(),

    layout: 'fit',

    tbar: [{
        xtype: 'tbtext',
        padding: '8 5',
        style: { fontSize: '12px' },
        html: 'Bypass Rules control what traffic is scanned by the applications. Bypassed traffic skips application processing. The rules are evaluated in order. Sessions that meet no rule are not bypassed.'.t()
    }],

    items: [{
        xtype: 'ungrid',

        tbar: ['@add', '->', '@import', '@export'],
        recordActions: ['edit', 'delete', 'reorder'],

        emptyText: 'No Bypass Rules defined'.t(),

        listProperty: 'settings.bypassRules.list',
        ruleJavaClass: 'com.untangle.uvm.network.BypassRuleCondition',
        conditions: [
            {name:"DST_ADDR",displayName: "Destination Address".t(), type: 'textfield', visible: true, vtype:"ipMatcher"},
            {name:"DST_PORT",displayName: "Destination Port".t(), type: 'textfield',vtype:"portMatcher", visible: true},
            {name:"DST_INTF",displayName: "Destination Interface".t(), type: 'checkboxgroup', values: Util.getInterfaceList(true, true), visible: true},
            {name:"SRC_ADDR",displayName: "Source Address".t(), type: 'textfield', visible: true, vtype:"ipMatcher"},
            {name:"SRC_PORT",displayName: "Source Port".t(), type: 'textfield',vtype:"portMatcher", visible: rpc.isExpertMode},
            {name:"SRC_INTF",displayName: "Source Interface".t(), type: 'checkboxgroup', values: Util.getInterfaceList(true, true), visible: true},
            {name:"PROTOCOL",displayName: "Protocol".t(), type: 'checkboxgroup', values: [["TCP","TCP"],["UDP","UDP"]], visible: true},
            {name:"CLIENT_TAGGED",displayName: 'Client Tagged'.t(), type: 'textfield', visible: true},
            {name:"SERVER_TAGGED",displayName: 'Server Tagged'.t(), type: 'textfield', visible: true},
        ],
        emptyRow: {
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

        bind: '{bypassRules}',

        columns: [
            Column.ruleId,
            Column.enabled,
            Column.description,
            Column.conditions,
        {
            header: 'Bypass'.t(),
            xtype: 'checkcolumn',
            dataIndex: 'bypass',
            width: Renderer.booleanWidth
        }],
        editorFields: [
            Field.enableRule(),
            Field.description,
            Field.conditions,
            Field.bypass
        ]
    }]
});
