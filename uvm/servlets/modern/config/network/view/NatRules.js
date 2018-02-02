Ext.define('Ung.config.network.view.NatRules', {
    extend: 'Ext.Panel',
    alias: 'widget.config-network-nat-rules',
    itemId: 'nat-rules',
    scrollable: true,

    viewModel: true,

    title: 'NAT Rules'.t(),

    layout: 'fit',

    // tbar: [{
    //     xtype: 'tbtext',
    //     padding: '8 5',
    //     style: { fontSize: '12px' },
    //     html: 'NAT Rules control the rewriting of the IP source address of traffic (Network Address Translation). The rules are evaluated in order.'.t()
    // }],

    items: [{
        xtype: 'mastergrid',
        flex: 3,

        settingsProperty: 'natRules',
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

        plugins: {
            gridcellediting: true,
            gridviewoptions: false
        },

        // defaults: {
        //     menuDisabled: true
        // },

        sortable: false,
        // columnMenu: null,

        // listeners: {
        //     painted: 'onPainted'
        // },

        // tbar: ['@add', '->', '@import', '@export'],
        // recordActions: ['edit', 'delete', 'reorder'],

        // emptyText: 'No NAT Rules defined'.t(),

        // listProperty: 'settings.natRules.list',
        // ruleJavaClass: 'com.untangle.uvm.network.NatRuleCondition',

        // conditions: [
        //     {name:"DST_ADDR",displayName: "Destination Address".t(), type: 'textfield', visible: true, vtype:"ipMatcher"},
        //     {name:"DST_PORT",displayName: "Destination Port".t(), type: 'textfield',vtype:"portMatcher", visible: true},
        //     {name:"DST_INTF",displayName: "Destination Interface".t(), type: 'checkboxgroup', values: Util.getInterfaceList(true, true), visible: true},
        //     {name:"SRC_ADDR",displayName: "Source Address".t(), type: 'textfield', visible: true, vtype:"ipMatcher"},
        //     {name:"SRC_PORT",displayName: "Source Port".t(), type: 'textfield',vtype:"portMatcher", visible: rpc.isExpertMode},
        //     {name:"SRC_INTF",displayName: "Source Interface".t(), type: 'checkboxgroup', values: Util.getInterfaceList(true, true), visible: true},
        //     {name:"PROTOCOL",displayName: "Protocol".t(), type: 'checkboxgroup', values: [["TCP","TCP"],["UDP","UDP"],["ICMP","ICMP"],["GRE","GRE"],["ESP","ESP"],["AH","AH"],["SCTP","SCTP"]], visible: true},
        //     {name:"CLIENT_TAGGED",displayName: 'Client Tagged'.t(), type: 'textfield', visible: true},
        //     {name:"SERVER_TAGGED",displayName: 'Server Tagged'.t(), type: 'textfield', visible: true},
        // ],

        // emptyRow: {
        //     ruleId: -1,
        //     enabled: true,
        //     auto: true,
        //     javaClass: 'com.untangle.uvm.network.NatRule',
        //     conditions: {
        //         javaClass: 'java.util.LinkedList',
        //         list: []
        //     },
        //     description: ''
        // },

        bind: '{natRules}',

        columns: [
        //     {
        //     text: 'Move'.t(),
        //     align: 'center',
        //     width: 60,
        //     cell: {
        //         tools: {
        //             menu: {
        //                 iconCls: 'x-fa fa-arrows-v',
        //                 margin: '0 20 0 0',
        //                 handler: 'showMenu',
        //             }
        //         }
        //     }
        //     // cell: {
        //     //     tools: {
        //     //         expand: {
        //     //             iconCls: 'x-fa fa-arrows-v',
        //     //             xtype: 'button',
        //     //             arrow: false,
        //     //             menu: {
        //     //                 indented: false,
        //     //                 minWidth: 150,
        //     //                 items: [{
        //     //                     text: 'First'.t(),
        //     //                     iconCls: 'x-fa fa-angle-double-up',
        //     //                     handler: 'moveRecord'
        //     //                 }, {
        //     //                     text: 'Up'.t(),
        //     //                     iconCls: 'x-fa fa-angle-up',
        //     //                     handler: 'moveRecord'
        //     //                 }, {
        //     //                     text: 'Down'.t(),
        //     //                     iconCls: 'x-fa fa-angle-down',
        //     //                     handler: 'moveRecord'
        //     //                 }, {
        //     //                     text: 'Last'.t(),
        //     //                     iconCls: 'x-fa fa-angle-double-down',
        //     //                     handler: 'moveRecord'
        //     //                 }, '-', {
        //     //                     text: 'Move After Rule'.t(),
        //     //                     // iconCls: 'x-fa fa-angle-right',
        //     //                     menu: {
        //     //                         indented: false,
        //     //                         minWidth: 150,
        //     //                         items: [
        //     //                             { text: '#1 cccccccc' },
        //     //                             { text: '#2 test' },
        //     //                             { text: '#3 new one' }
        //     //                         ]
        //     //                     }
        //     //                 }]
        //     //             }
        //     //         }
        //     //     }
        //     // }
        // },
            {
            text: '<span class="x-fa fa-sort"></span>',
            width: 44,
            align: 'center',
            resizable: false,
            menuDisabled: true,
            cell: {
                tools: {
                    menu: {
                        iconCls: 'x-fa fa-sort',
                        margin: '0 20 0 0',
                        handler: 'showMoveMenu',
                    }
                }
            }
        }, {
            text: '#' + 'id'.t(),
            width: 44,
            align: 'right',
            resizable: false,
            menuDisabled: true,
            dataIndex: 'ruleId',
            renderer: Renderer.id,
            cell: {
                encodeHtml: false
            }
        }, {
            // text: 'Enable'.t(),
            text: '<span class="x-fa fa-check"></span>',
            width: 44,
            xtype: 'checkcolumn',
            headerCheckbox: false,
            dataIndex: 'enabled',
            resizable: false
        }, {
            text: 'Description',
            width: 200,
            dataIndex: 'description',
            editable: true,
            cell: {
                encodeHtml: false
            },
            renderer: function (val) {
                if (!val) {
                    return '<em style="color: #999;">add a description</em>';
                }
                return val;
            }
        }, {
            text: 'Conditions'.t(),
            width: Renderer.messageWidth,
            flex: 1,
            dataIndex: 'conditions',
            cell: {
                encodeHtml: false,
                bodyCls: 'cond',
                tools: {
                    menu: {
                        iconCls: 'x-fa fa-filter',
                        margin: '0 10 0 0',
                        handler: 'showMenu',
                        // zone: 'end'
                    }
                }
            },
            renderer: function (value) {
                var html = [], condition;

                if (value.list.length === 0) {
                    return '<span class="x-fa fa-arrow-left" style="color: #999;"></span> &nbsp;&nbsp;&nbsp; <em style="color: #999;">click to add conditions</em>';
                }

                Ext.Array.each(value.list, function (cond) {
                    condition = Condition[cond.conditionType];

                    if (condition.type === 'menuradioitem') {
                        html.push('<div><span class="type">' + condition.text + '</span><span class="' + (cond.invert ? 'bool-no' : 'bool-yes') + '">' + (cond.invert ? '<span class="x-fa fa-times" style="padding: 0;"></span>' : '<span class="x-fa fa-check" style="padding: 0;"></span>') + '</span></div>');
                        return;
                    }

                    html.push('<div><span class="type">' + Condition[cond.conditionType].text + '</span><span class="invert">' + (cond.invert ? 'NOT' : 'IS')  + '</span><span class="value">' + (cond.value || '<span class="x-fa fa-question-circle" style="padding: 0; color: orangered;"></span>' ) + '</span></div>');
                });
                // return html.split(',');
                return html.join('');
                // return html.join(', ');
                // for (var i = 0; i < value.list.length; i += 1) {
                //     var valueRenderer = [];

                //     switch (conds[i].conditionType) {
                //     case 'SRC_INTF':
                //     case 'DST_INTF':
                //         conds[i].value.toString().split(',').forEach(function (intfff) {
                //             valueRenderer.push(Util.interfacesListNamesMap()[intfff]);
                //         });
                //         break;
                //     case 'DST_LOCAL':
                //     case 'WEB_FILTER_FLAGGED':
                //         valueRenderer.push('true'.t());
                //         break;
                //     case 'DAY_OF_WEEK':
                //         conds[i].value.toString().split(',').forEach(function (day) {
                //             valueRenderer.push(Util.weekdaysMap[day]);
                //         });
                //         break;
                //     default:
                //         // to avoid exceptions, in some situations condition value is null
                //         if (conds[i].value !== null) {
                //             valueRenderer = conds[i].value.toString().split(',');
                //         } else {
                //             valueRenderer = [];
                //         }
                //     }
                //     // for boolean conditions just add 'True' string as value
                //     // if (view.conditionsMap[conds[i].conditionType].type === 'boolean') {
                //     //     valueRenderer = ['True'.t()];
                //     // }

                //     resp.push(view.conditionsMap[conds[i].conditionType].displayName + '<strong>' + (conds[i].invert ? ' &nrArr; ' : ' &rArr; ') + '<span class="cond-val ' + (conds[i].invert ? 'invert' : '') + '">' + valueRenderer.join(', ') + '</span>' + '</strong>');
                // }
            }
        }, {
            text: 'NAT Type'.t(),
            width: 150,
            dataIndex: 'auto',
            cell: {
                xtype: 'widgetcell',
                widget: {
                    xtype: 'combobox',
                    margin: '0 10',
                    editable: false,
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'value',
                    // bind: '{record.auto}',
                    store: [
                        { name: 'Auto'.t(), value: true },
                        { name: 'Custom'.t(), value: false }
                    ]
                }
            }
            // renderer: Ung.config.network.MainController.natTypeRenderer
        }, {
            text: 'New Source'.t(),
            dataIndex: 'newSource',
            width: 150,
            editable: true,
            editor: {
                xtype: 'textfield'
            }
            // renderer: Ung.config.network.MainController.natNewSourceRenderer
        }, {
            align: 'center',
            text: '<span class="x-fa fa-trash"></span>',
            width: 44,
            resizable: false,
            menuDisabled: true,
            cell: {
                tools: {
                    minus: {
                        iconCls: 'x-fa fa-trash',
                        handler: 'removeRecord',
                    }
                }
            }
        }]
        // editorFields: [
        //     Field.enableRule('Enable NAT Rule'.t()),
        //     Field.description,
        //     Field.conditions,
        //     Field.natType,
        //     Field.natSource
        // ]
    }],

    // rulesMenu: {
    //     xtype: 'menu',
    //     viewModel: {},
    //     anchor: true,
    //     padding: '10 0',
    //     defaultType: 'menucheckitem',
    //     mouseLeaveDelay: 0,
    //     // maxHeight: 200,
    //     // scrollable: true,
    //     tbar: {
    //         items: [{
    //             xtype: 'component',
    //             html: 'Conditions'.t()
    //         }]
    //     },
    //     defaults: {
    //         menu: {
    //             padding: '10 0',
    //             tbar: {
    //                 layout: {
    //                     pack: 'center'
    //                 },
    //                 items: [{
    //                     xtype: 'togglefield',
    //                     label: 'Equals',
    //                     labelAlign: 'left',
    //                     labelWidth: 'auto',
    //                     boxLabel: 'NOT Equals'
    //                     // xtype: 'combobox',
    //                     // queryMode: 'local',
    //                     // displayField: 'text',
    //                     // valueField: 'invert',
    //                     // editable: false,
    //                     // value: false,
    //                     // flex: 1,
    //                     // store: [
    //                     //     { text: 'Equals'.t(), invert: false },
    //                     //     { text: 'Not Equals'.t(), invert: true }
    //                     // ]
    //                 }]
    //             }
    //         }
    //     },
    //     items: [{
    //         text: 'Destination Address'.t(),
    //         val: 'DST_ADDR',
    //         menu: {
    //             minWidth: 150,
    //             indented: false,
    //             items: [
    //                 { xtype: 'textfield', placeholder: 'enter address', iconCls: 'x-fa fa-font' }
    //             ],
    //         }
    //     }, {
    //         text: 'Destination Port'.t(),
    //         val: 'DST_PORT',
    //         menu: {
    //             minWidth: 150,
    //             indented: false,
    //             items: [
    //                 { xtype: 'numberfield', placeholder: 'enter port' }
    //             ]
    //         }
    //     }, {
    //         text: 'Destination Interface'.t(),
    //         val: 'DST_INTF',
    //         menu: {
    //             minWidth: 150,
    //             defaultType: 'menucheckitem',
    //             defaults: {
    //                 handler: 'check'
    //             },
    //             items: [
    //                 { text: 'Any' },
    //                 { text: 'Any Non-WAN' },
    //                 { text: 'Any WAN' },
    //                 { text: 'External' },
    //                 { text: 'Internal' },
    //                 { text: 'vlan test' },
    //                 { text: 'vlan 2' },
    //                 { text: 'vlan 3' },
    //                 { text: 'OpenVPN' },
    //                 { text: 'L2TP' },
    //                 { text: 'XAUTH' },
    //                 { text: 'GRE' }
    //             ],
    //         }
    //     }, {
    //         text: 'Source Address'.t(),
    //         val: 'SRC_ADDR',
    //         checked: false,
    //         menu: {
    //             minWidth: 150,
    //             indented: false,
    //             items: [
    //                 { xtype: 'textfield', placeholder: 'enter address' },
    //             ]
    //         }
    //     }, {
    //         text: 'Source Interface'.t(),
    //         val: 'SRC_INTF',
    //         menu: {
    //             minWidth: 150,
    //             // maxHeight: 300,
    //             // scrollable: true,
    //             defaultType: 'menucheckitem',
    //             items: [
    //                 { text: 'Any' },
    //                 { text: 'Any Non-WAN' },
    //                 { text: 'Any WAN' },
    //                 { text: 'External' },
    //                 { text: 'Internal' },
    //                 { text: 'vlan test' },
    //                 { text: 'vlan 2' },
    //                 { text: 'vlan 3' },
    //                 { text: 'OpenVPN' },
    //                 { text: 'L2TP' },
    //                 { text: 'XAUTH' },
    //                 { text: 'GRE' }
    //             ],
    //         }
    //     }, {
    //         text: 'Protocol'.t(),
    //         val: 'PROTOCOL',
    //         menu: {
    //             minWidth: 150,
    //             defaultType: 'menucheckitem',
    //             items: [
    //                 { text: 'TCP' },
    //                 { text: 'UDP' },
    //                 { text: 'ICMP' },
    //                 { text: 'GRE' },
    //                 { text: 'ESP' },
    //                 { text: 'AH' },
    //                 { text: 'SCTP' }
    //             ],
    //         }
    //     }, {
    //         text: 'Client Tagged'.t(),
    //         val: 'CLIENT_TAGGED',
    //         checked: false,
    //         menu: {
    //             minWidth: 150,
    //             indented: false,
    //             items: [
    //                 { xtype: 'textfield', placeholder: 'enter target' },
    //             ]
    //         }
    //     }, {
    //         text: 'Server Tagged'.t(),
    //         val: 'SERVER_TAGGED',
    //         checked: false,
    //         menu: {
    //             minWidth: 150,
    //             indented: false,
    //             items: [
    //                 { xtype: 'textfield', placeholder: 'enter target' },
    //             ]
    //         }
    //     }]
    // }
});
