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
            },
            params: false
        }
    },

    defaultType: 'panel',
    layout: 'fit',

    tbar: {
        padding: 8,
        hidden: true,
        bind: { hidden: '{!params}' },
        shadow: false,
        items: [{
            xtype: 'button',
            iconCls: 'x-fa fa-chevron-left',
            handler: function () { Ung.app.redirectTo('#reports'); },
            hidden: true,
            bind: {
                hidden: '{ screen === "WIDE" }'
            }
        }, {
            xtype: 'component',
            margin: '0 0 0 8',
            bind: {
                html: '{ttl}',
            }
        }]
    },

    listeners: {
        painted: 'onInitialize',
        deactivate: 'onDeactivate'
        // activate: 'onActivate'
    },

    items: [{
        layout: 'fit',

        shadow: true,
        zIndex: 999,
        hidden: true,

        bind: {
            docked: '{ screen === "WIDE" ? "left" : null }',
            width: '{ screen === "WIDE" ? 320 : null }',
            hidden: '{ params && screen !== "WIDE" }',
        },

        tbar: {
            shadow: false,
            items: [{
                xtype: 'searchfield',
                ui: 'faded',
                flex: 1,
                placeholder: 'Find reports...'.t(),
            }]
        },

        items: [{
            xtype: 'treelist',
            // userCls: 'x-nav',
            scrollable: true,
            userCls: 'reports-menu',
            ui: 'nav',
            animation: {
                duration: 150,
                easing: 'ease'
            },
            singleExpand: true,
            rootVisible: false,
            expanderFirst: false,
            expanderOnly: false,
            // selectOnExpander: true,
            // highlightPath: false,
            store: 'reportstree',
            listeners: {
                // select: 'onSelectionChange'
                selectionchange: 'onSelectionChange'
            }
        }]
    }, {
        xtype: 'container',
        layout: 'center',
        hidden: true,
        bind: {
            hidden: '{params || screen !== "WIDE"}'
        },
        items: [{
            xtype: 'component',
            cls: 'reports-bg',
            width: 500,
            margin: '0 auto 0 -250',
            html: '<i class="x-fa fa-area-chart fa-4x" style="font-style: normal; color: #EEE; font-size: 10em; margin: 10px;"></i>' +
                  '<i class="x-fa fa-line-chart fa-4x" style="font-style: normal; color: #EEE; font-size: 10em; margin: 10px;"></i>' +
                  '<i class="x-fa fa-pie-chart fa-4x" style="font-style: normal; color: #EEE; font-size: 10em; margin: 10px;"></i>'
        }, {
            html: '<h1 style="font-family: \'Roboto Condensed\'; font-weight: 100; color: #777;">Select a Report from a Category!</h1>'
        }]
    }, {
        xtype: 'container',
        hidden: true,
        bind: {
            hidden: '{!params}'
        },
        items: [{
            xtype: 'container',
            style: {
                background: '#EEE'
            },
            layout: 'center',
            items: [{
                xtype: 'component',
                html: 'Graph placeholder'
            }],
            listeners: {
                // painted: function (s, v) {
                //     v.setHeight(Ext.Number.parseInt(v.getWidth()/3));
                // },
                resize: 'onResize'
            }
        }]
    }]
    //     {
    //     xtype: 'panel',
    //     itemId: 'reports',
    //     // layout: {
    //     //     type: 'vbox',
    //     //     align: 'stretch'
    //     // },
    //     layout: 'card',
    //     bind: {
    //         title: '{entry.title}',
    //         activeItem: '{activeItem}'
    //     },
    //     // tbar: {
    //     //     style: {
    //     //         // background: '#F5F5F5',
    //     //         fontSize: '14px',
    //     //         fontWeight: 400,
    //     //         zIndex: 10
    //     //     },
    //     //     bind: {
    //     //         html: '{entry.description}'
    //     //     }
    //     // },
    //     // {
    //     //     xtype: 'toolbar',
    //     //     docked: 'top',
    //     //     shadow: false,
    //     //     padding: 16,
    //     //     style: {
    //     //         // background: '#F5F5F5',
    //     //         fontSize: '14px',
    //     //         fontWeight: 400,
    //     //         zIndex: 10
    //     //     },
    //     //     bind: {
    //     //         html: '{entry.type === "EVENT_LIST" ? entry.description : ""}'
    //     //     }
    //     // }
    //     items: [{
    //         xtype: 'graphreport',
    //         reference: 'graphreport',
    //         flex: 1,
    //         padding: 5,
    //         border: true
    //     }, {
    //         xtype: 'eventreport',
    //         reference: 'eventreport',
    //         flex: 1,
    //         border: true
    //     }, {
    //         title: 'Text Report',
    //         reference: 'textreport',
    //         flex: 1,
    //         padding: 5,
    //         border: true,
    //         html: 'text report'
    //     }, {
    //         xtype: 'toolbar',
    //         docked: 'top',
    //         items: [{
    //             text: 'Columns'.t(),
    //             iconCls: 'x-fa fa-bars fa-rotate-90',
    //             itemId: 'columnsMenu',
    //             menu: {
    //                 defaultType: 'menucheckitem',
    //                 indented: false,
    //                 mouseLeaveDelay: 0
    //             }
    //         }, {
    //             // xtype: 'button',
    //             bind: {
    //                 text: '{eventsGroups.eventslimit} Events',
    //                 hidden: '{entry.type !== "EVENT_LIST"}'
    //             },
    //             menu: {
    //                 anchor: true,
    //                 defaultType: 'menuradioitem',
    //                 separator: true,
    //                 indented: false,
    //                 bind: {
    //                     groups: '{eventsGroups}'
    //                 },
    //                 defaults: {
    //                     group: 'eventslimit',
    //                     listeners: {
    //                         // checkchange: function (el) {
    //                         //     // console.log(el, el.up('menu'));
    //                         //     if (el && el.up('menu')) {
    //                         //         el.up('menu').close();
    //                         //     }
    //                         //     // if (el.getMenu()) {
    //                         //     //     el.getMenu().close();
    //                         //     // }
    //                         // }
    //                     }
    //                 },
    //                 items: [
    //                     { text: '100'.t(), value: 100 },
    //                     { text: '500'.t(), value: 500 },
    //                     { text: '1000'.t(), value: 1000 },
    //                     { text: '5000'.t(), value: 5000 },
    //                     { text: '10000'.t(), value: 10000 },
    //                     { text: '50000'.t(), value: 50000 }
    //                 ]
    //             }
    //         }]
    //     }]
    // }, {
    //     xtype: 'toolbar',
    //     docked: 'bottom',
    //     ui: 'alt',
    //     defaults: {
    //         ui: 'raised action',
    //         margin: '0 20 0 0'
    //     },
    //     items: [
    //         // {
    //         // label: 'Since'.t(),
    //         // labelAlign: 'left',
    //         // xtype: 'combobox',
    //         // value: 24,
    //         // editable: false,
    //         // displayField: 'display',
    //         // valueField: 'value',
    //         // // ui: 'faded',
    //         // store: [
    //         //     { value: 1, display: '1 hour'.t() },
    //         //     { value: 3, display: '3 hours'.t() },
    //         //     { value: 6, display: '6 hours'.t() },
    //         //     { value: 12, display: '12 hours'.t() },
    //         //     { value: 24, display: '1 day'.t() },
    //         //     { value: 24 * 3, display: '3 days'.t() },
    //         //     { value: 24 * 7, display: '1 week'.t() },
    //         //     { value: 24 * 14, display: '2 weeks'.t() },
    //         //     { value: 24 * 30, display: '1 month'.t() }
    //         // ],
    //         // queryMode: 'local'
    //         // // disabled: true
    //     // }, {}
    //     ]
    // }, {
    //     xtype: 'graphdata',
    //     docked: 'bottom',
    //     height: '40%',
    //     resizable: {
    //         split: true,
    //         edges: 'north'
    //     },
    //     hidden: true,
    //     bind: {
    //         hidden: '{activeItem !== "graphreport"}'
    //     }
    // }]

});
