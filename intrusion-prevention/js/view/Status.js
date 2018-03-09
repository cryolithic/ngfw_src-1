Ext.define('Ung.apps.intrusionprevention.view.Status', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.app-intrusion-prevention-status',
    itemId: 'status',
    title: 'Status'.t(),

    layout: 'border',

    items: [{
        region: 'center',
        border: false,
        bodyPadding: 10,

        layout: {
            type: 'vbox',
            align: 'stretch'
        },

        scrollable: 'y',
        items: [{
            xtype: 'component',
            cls: 'app-desc',
            html: '<img src="/icons/apps/intrusion-prevention.svg" width="80" height="80"/>' +
                '<h3>Intrusion Prevention</h3>' +
                '<p>' + 'Intrusion Prevention scans, detects, and blocks attacks and suspicious traffic using signatures.'.t() + '</p>'
        }, {
            xtype: 'applicense',
            hidden: true,
            bind: {
                hidden: '{!license || !license.trial}'
            }
        }, {
            xtype: 'appstate',
            hidden: true,
            bind: {
                hidden: '{settings.configured == false}'
            }
        }, {
            xtype: 'fieldset',
            title: '<i class="fa fa-magic"></i> ' + "Setup Wizard".t(),
            items: [{
                xtype: 'component',
                html: "Intrusion Prevention is unconfigured. Use the Wizard to configure Intrusion Prevention.".t(),
                cls: 'warning',
                hidden: true,
                bind: {
                    hidden: '{settings.configured == true}'
                }
            },{
                xtype: 'fieldset',
                title: "Profile".t(),
                defaults: {
                    labelWidth: 200
                },
                hidden: true,
                bind: {
                    hidden: '{instance.runState !== "RUNNING"}'
                },
                items: [{
                    xtype: 'displayfield',
                    fieldLabel: "Classtypes".t(),
                    bind: {
                        value: '{getWizardClasstypes}',
                    },
                    listeners:{
                        change: 'bindChange'
                    },
                }, {
                    xtype: 'displayfield',
                    fieldLabel: "Categories".t(),
                    bind: {
                        value: '{getWizardCategories}'
                    },
                    listeners:{
                        change: 'bindChange'
                    },
                }]
            }, {
                xtype: 'button',
                margin: '10 0 10 0',
                text: "Run Intrusion Prevention Setup Wizard".t(),
                iconCls: 'fa fa-magic',
                handler: 'runWizard'
            }]
        },{
            xtype: 'fieldset',
            title: '<i class="fa fa-clock-o"></i> ' + "Updates".t(),
            defaults: {
                labelWidth: 200
            },
            padding: 10,
            collapsed: true,
            disabled: true,
            bind: {
                collapsed: '{instance.runState !== "RUNNING"}',
                disabled: '{instance.runState !== "RUNNING"}'
            },

            items: [{
                xtype: 'displayfield',
                fieldLabel: "Last check for updates".t(),
                bind: '{lastUpdateCheck}'
            }, {
                xtype: 'displayfield',
                fieldLabel: "Last update".t(),
                bind: '{lastUpdate}'
            }, {
                xtype: 'component',
                html: Ext.String.format("{0}Note:{1} {2} continues to maintain the default signature settings through automatic updates. You are free to modify and add signatures, however it is not required.".t(), '<b>', '</b>', rpc.companyName)
            }]
        }, {
            xtype: 'appreports'
        }]
    }, {
        region: 'west',
        border: false,
        width: 350,
        minWidth: 300,
        split: true,
        layout: 'fit',
        items: [{
            xtype: 'appmetrics',
        }],
        bbar: [{
            xtype: 'appremove',
            width: '100%'
        }]
    }]
});
