Ext.define('Ung.util.Column', {
    singleton: true,
    alternateClassName: 'Column',

    DELETE: {
        xtype: 'gridcolumn',
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
    },

    MOVE: {
        xtype: 'gridcolumn',
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
    },

    RULEID: {
        xtype: 'gridcolumn',
        text: '#' + 'id'.t(),
        width: 44,
        align: 'right',
        resizable: false,
        menuDisabled: true,
        dataIndex: 'ruleId',
        cell: {
            encodeHtml: false
        }
    },

    ENABLED: {
        text: '<span class="x-fa fa-check"></span>',
        width: 44,
        xtype: 'checkcolumn',
        headerCheckbox: false,
        dataIndex: 'enabled',
        resizable: false
    },

    DESCRIPTION: {
        xtype: 'gridcolumn',
        text: 'Description',
        width: 200,
        dataIndex: 'description',
        cell: {
            encodeHtml: false
        },
        editable: true,
        editor: {
            xtype: 'textfield',
            // required: true
        },
        renderer: function (val) {
            if (!val) {
                return '<em style="color: #999;">add a description</em>';
            }
            return val;
        }
    },

    CONDITIONS: {
        xtype: 'gridcolumn',
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
                    handler: 'showConditionsMenu',
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
        }
    },

    NAT_TYPE: {
        xtype: 'gridcolumn',
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
    },

    BYPASS: {
        text: 'Bypass'.t(),
        width: 60,
        xtype: 'checkcolumn',
        headerCheckbox: false,
        dataIndex: 'bypass',
        resizable: false
    },    

    IPV6ENABLED: {
        text: 'IPv6'.t(),
        width: 60,
        xtype: 'checkcolumn',
        headerCheckbox: false,
        dataIndex: 'ipv6Enabled',
        resizable: false
    },

    BLOCKED: {
        xtype: 'gridcolumn',
        text: 'Action'.t(),
        width: 150,
        dataIndex: 'blocked',
        cell: {
            xtype: 'widgetcell',
            widget: {
                xtype: 'combobox',
                margin: '0 10',
                editable: false,
                queryMode: 'local',
                displayField: 'name',
                valueField: 'value',
                store: [
                    { name: 'Block'.t(), value: true },
                    { name: 'Pass'.t(), value: false }
                ]
            }
        }
    } 

});
