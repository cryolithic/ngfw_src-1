Ext.define('Ung.config.network.view.BypassRules', {
    extend: 'Ext.Panel',
    alias: 'widget.config-network-bypass-rules',
    itemId: 'bypass-rules',
    scrollable: true,

    viewModel: true,

    title: 'Bypass Rules'.t(),

    layout: 'fit',

    // tbar: {
    //     height: 'auto',
    //     style: {
    //         background: '#EEE',
    //         display: 'block'
    //     },
    //     items: [{
    //         xtype: 'component',
    //         style: {
    //             fontSize: '14px',
    //         },
    //         html: 'Bypass Rules control what traffic is scanned by the applications. Bypassed traffic skips application processing. The rules are evaluated in order. Sessions that meet no rule are not bypassed.'.t()
    //     }]
    // },



    items: [{
        xtype: 'mastergrid',
        flex: 3,

        enableMove: true,
        enableDelete: true,

        settingsProperty: 'bypassRules',
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
        conditionClass: 'com.untangle.uvm.network.BypassRuleCondition',
        newRecord: {
            ruleId: -1,
            enabled: true,
            auto: true,
            javaClass: 'com.untangle.uvm.network.BypassRule',
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

        bind: '{bypassRules}',

        columnsDef: [
            Column.RULEID,
            Ext.apply(Column.ENABLED, { renderer: Renderer.id }),
            Column.DESCRIPTION,
            Column.CONDITIONS
        ]
    }, {
        xtype: 'paneldescription',
        html: 'Bypass Rules control what traffic is scanned by the applications. Bypassed traffic skips application processing. The rules are evaluated in order. Sessions that meet no rule are not bypassed.'.t()
    }]
});
