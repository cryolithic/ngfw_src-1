Ext.define('Ung.view.reports.Reports', {
    extend: 'Ext.Panel',
    alias: 'widget.ung-reports',
    itemId: 'reports',


    controller: 'reports',
    viewModel: {
        data: {
            activeItem: 'graphreport',
            menuGroups: {
                since: 24 // hours
            },
            eventsGroups: {
                eventslimit: 1000
            }
        }
    },

    defaultType: 'panel',
    layout: 'fit',

    listeners: {
        painted: 'onInitialize',
        // activate: 'onActivate'
    },

    items: [{
        docked: 'left',
        width: 350,
        layout: 'fit',

        tbar: {
            items: [{
                xtype: 'searchfield',
                ui: 'faded',
                flex: 1,
                placeholder: 'Find reports...'.t(),
            }]
        },
        resizable: {
            split: true,
            edges: 'east'
        },
        items: [{
            xtype: 'treelist',
            scrollable: true,
            ui: 'nav',
            singleExpand: true,
            expanderFirst: false,
            expanderOnly: false,
            selectOnExpander: true,
            highlightPath: false,
            store: 'reportstree',
            listeners: {
                selectionchange: 'onSelectionChange'
            }
        }]
    }, {
        xtype: 'panel',
        itemId: 'reports',
        // layout: {
        //     type: 'vbox',
        //     align: 'stretch'
        // },
        layout: 'card',
        bind: {
            title: '{entry.title}',
            activeItem: '{activeItem}'
        },
        // tbar: {
        //     style: {
        //         // background: '#F5F5F5',
        //         fontSize: '14px',
        //         fontWeight: 400,
        //         zIndex: 10
        //     },
        //     bind: {
        //         html: '{entry.description}'
        //     }
        // },
        // {
        //     xtype: 'toolbar',
        //     docked: 'top',
        //     shadow: false,
        //     padding: 16,
        //     style: {
        //         // background: '#F5F5F5',
        //         fontSize: '14px',
        //         fontWeight: 400,
        //         zIndex: 10
        //     },
        //     bind: {
        //         html: '{entry.type === "EVENT_LIST" ? entry.description : ""}'
        //     }
        // }
        items: [{
            xtype: 'graphreport',
            reference: 'graphreport',
            flex: 1,
            padding: 5,
            border: true
        }, {
            xtype: 'eventreport',
            reference: 'eventreport',
            flex: 1,
            border: true
        }, {
            title: 'Text Report',
            reference: 'textreport',
            flex: 1,
            padding: 5,
            border: true,
            html: 'text report'
        }, {
            xtype: 'toolbar',
            docked: 'top',
            items: [{
                text: 'Columns'.t(),
                iconCls: 'x-fa fa-bars',
                itemId: 'columnsMenu',
                menu: {
                    defaultType: 'menucheckitem',
                    indented: false,
                    mouseLeaveDelay: 0
                }
            }, {
                // xtype: 'button',
                bind: {
                    text: '{eventsGroups.eventslimit} Events',
                    hidden: '{entry.type !== "EVENT_LIST"}'
                },
                menu: {
                    anchor: true,
                    defaultType: 'menuradioitem',
                    separator: true,
                    indented: false,
                    bind: {
                        groups: '{eventsGroups}'
                    },
                    defaults: {
                        group: 'eventslimit',
                        listeners: {
                            // checkchange: function (el) {
                            //     // console.log(el, el.up('menu'));
                            //     if (el && el.up('menu')) {
                            //         el.up('menu').close();
                            //     }
                            //     // if (el.getMenu()) {
                            //     //     el.getMenu().close();
                            //     // }
                            // }
                        }
                    },
                    items: [
                        { text: '100'.t(), value: 100 },
                        { text: '500'.t(), value: 500 },
                        { text: '1000'.t(), value: 1000 },
                        { text: '5000'.t(), value: 5000 },
                        { text: '10000'.t(), value: 10000 },
                        { text: '50000'.t(), value: 50000 }
                    ]
                }
            }]
        }]
    }, {
        xtype: 'toolbar',
        docked: 'bottom',
        items: [{
            // label: 'Since'.t(),
            // labelAlign: 'left',
            // xtype: 'combobox',
            // value: 24,
            // editable: false,
            // displayField: 'display',
            // valueField: 'value',
            // // ui: 'faded',
            // store: [
            //     { value: 1, display: '1 hour'.t() },
            //     { value: 3, display: '3 hours'.t() },
            //     { value: 6, display: '6 hours'.t() },
            //     { value: 12, display: '12 hours'.t() },
            //     { value: 24, display: '1 day'.t() },
            //     { value: 24 * 3, display: '3 days'.t() },
            //     { value: 24 * 7, display: '1 week'.t() },
            //     { value: 24 * 14, display: '2 weeks'.t() },
            //     { value: 24 * 30, display: '1 month'.t() }
            // ],
            // queryMode: 'local'
            // // disabled: true
        }, {
            xtype: 'button',
            bind: {
                text: 'Since {menuGroups.since}',
            },
            menu: {
                anchor: true,
                align: 'b-br',
                defaultType: 'menuradioitem',
                bind: {
                    groups: '{menuGroups}'
                },
                defaults: {
                    group: 'since'
                },
                items: [
                    { text: '1 hour'.t(), value: 1 },
                    { text: '3 hours'.t(), value: 3 },
                    { text: '6 hours'.t(), value: 6 },
                    { text: '12 hours'.t(), value: 12 },
                    { text: '1 day'.t(), value: 24 },
                    { text: '3 days'.t(), value: 24 * 3 },
                    { text: '1 week'.t(), value: 24 * 7 },
                    { text: '2 weeks'.t(), value: 24 * 14 },
                    { text: '1 month'.t(), value: 24 * 30 },
                    // {
                    //     text: 'Date/Time',
                    //     separator: true,
                    //     menu: {
                    //         items: {
                    //             xtype: 'datepanel',
                    //             value: new Date()
                    //         }
                    //     }
                    // }
                ]
            }
        }]
    }, {
        xtype: 'graphdata',
        docked: 'bottom',
        height: '40%',
        resizable: {
            split: true,
            edges: 'north'
        },
        hidden: true,
        bind: {
            hidden: '{activeItem !== "graphreport"}'
        }
    }]
});
