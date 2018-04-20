Ext.define('Ung.Setup.InternetConnection', {
    extend: 'Ext.form.Panel',
    alias: 'widget.Internet',

    title: 'Internet Connection'.t(),
    description: 'Configure the Internet Connection'.t(),

    layout: {
        type: 'hbox',
        align: 'begin',
        pack: 'center'
    },

    items: [{
        xtype: 'container',
        margin: '50 20 0 0',
        width: 300,
        layout: {
            type: 'vbox',
            // align: 'stretch'
        },
        hidden: true,
        bind: {
            hidden: '{!wan}'
        },
        items: [{
            xtype: 'component',
            cls: 'sectionheader',
            margin: '0 0 10 0',
            html: 'Configuration Type'.t()
        }, {
            xtype: 'radiogroup',
            // fieldLabel: 'Configuration Type'.t(),
            // labelWidth: 160,
            labelAlign: 'right',
            simpleValue: true,
            layout: { type: 'hbox' },
            defaults: { padding: '1 15 1 0' },
            items: [
                { boxLabel: '<strong>' + 'Auto (DHCP)'.t() + '</strong>', inputValue: 'AUTO' },
                { boxLabel: '<strong>' + 'Static'.t() + '</strong>', inputValue: 'STATIC' },
                { boxLabel: '<strong>' + 'PPPoE'.t() + '</strong>', inputValue: 'PPPOE' }
            ],
            bind: {
                value: '{wan.v4ConfigType}'
            }
        }, {
            xtype: 'button',
            text: 'Renew DHCP'.t(),
            iconCls: 'fa fa-refresh',
            // handler: 'renewDhcp', // renew DHCP and refresh status
            bind: {
                hidden: '{wan.v4ConfigType !== "AUTO"}'
            }
        }, {
            xtype: 'container',
            width: 200,
            margin: '0 10',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            hidden: true,
            bind: {
                hidden: '{wan.v4ConfigType !== "STATIC"}'
            },
            defaults: {
                xtype: 'textfield',
                labelAlign: 'top',
                msgTarget: 'side',
                validationEvent: 'blur',
                maskRe: /(\d+|\.)/,
                vtype: 'ipAddress',
                disabled: true,
                bind: {
                    disabled: '{wan.v4ConfigType !== "STATIC"}'
                }
            },
            items: [{
                fieldLabel: 'IP Address'.t(),
                allowBlank: false,
                bind: { value: '{wan.v4StaticAddress}', emptyText: '{wan.v4Address}' }
            }, {
                fieldLabel: 'Netmask'.t(),
                xtype: 'combo',
                store: Util.v4NetmaskList,
                queryMode: 'local',
                triggerAction: 'all',
                value: 24,
                bind: { value: '{wan.v4StaticPrefix}', emptyText: '/{wan.v4PrefixLength} - {wan.v4Netmask}' },
                editable: false,
                allowBlank: false
            }, {
                fieldLabel: 'Gateway'.t(),
                allowBlank: false,
                bind: { value: '{wan.v4StaticGateway}', emptyText: '{wan.v4Gateway}' }
            }, {
                fieldLabel: 'Primary DNS'.t(),
                allowBlank: false,
                bind: { value: '{wan.v4StaticDns1}', emptyText: '{wan.v4Dns1}' }
            }, {
                xtype: 'textfield',
                vtype: 'ipAddress',
                name: 'dns2',
                fieldLabel: 'Secondary DNS'.t(),
                allowBlank: true,
                bind: { value: '{wan.v4StaticDns2}', emptyText: '{wan.v4Dns2}' }
            }]
        }, {
            xtype: 'container',
            hidden: true,
            bind: {
                hidden: '{wan.v4ConfigType !== "PPPOE"}'
            },
            defaults: {
                xtype: 'textfield',
                labelWidth: 150,
                width: 350,
                labelAlign: 'right'
            },
            items: [{
                fieldLabel: 'Username'.t(),
                bind: { value: '{wan.v4PPPoEUsername}' }
            }, {
                inputType: 'password',
                fieldLabel: 'Password'.t(),
                bind: { value: '{wan.v4PPPoEPassword}' }
            }]
        }]
    }, {
        xtype: 'container',
        margin: '50 20 0 0',
        width: 200,
        hidden: true,
        bind: {
            hidden: '{!wan}'
        },
        layout: {
            type: 'vbox',
            // align: 'stretch'
        },
        defaults: {
            xtype: 'displayfield',
            // labelWidth: 170,
            labelAlign: 'right',
            margin: 0
        },
        items: [{
            xtype: 'component',
            cls: 'sectionheader',
            margin: '0 0 10 0',
            html: 'Status'.t()
        }, {
            fieldLabel: 'IP Address'.t(),
            bind: { value: '{wan.v4Address}' }
        }, {
            fieldLabel: 'Netmask'.t(),
            bind: { value: '{wan.v4Netmask}' }
        }, {
            fieldLabel: 'Gateway'.t(),
            bind: { value: '{wan.v4Gateway}' }
        }, {
            fieldLabel: 'Primary DNS'.t(),
            bind: { value: '{wan.v4Dns1}' }
        }, {
            fieldLabel: 'Secondary DNS'.t(),
            bind: { value: '{wan.v4Dns2}' }
        }, {
            xtype: 'button',
            text: 'Test Connectivity'.t(),
            iconCls: 'fa fa-compress',
            handler: 'onSave', // save is called because connectivity test is done inside of it
            bind: {
                hidden: '{wan.v4ConfigType !== "AUTO" && wan.v4ConfigType !== "STATIC" }'
            }
        }]
    }],


    listeners: {
        activate: 'getInterface',
        save: 'onSave',
    },

    controller: {

        getInterface: function () {
            var me = this, vm = this.getViewModel(),
                interfaces = vm.get('networkSettings.interfaces.list'),
                wanStatus,
                // first WAN is external interface
                wan = Ext.Array.findBy(interfaces, function (intf) {
                    return (intf.isWan && intf.configType !== 'DISABLED');
                });

            // wan = null;

            if (wan) {
                try {
                    wanStatus = rpc.networkManager.getInterfaceStatus(wan.interfaceId);
                    Ext.applyIf(wan, wanStatus); // apply status on wan
                } catch (e) {
                    Util.handleException('Unable to fetch WAN interface status!'.t());
                }
            } else {
                Ext.Msg.show({
                    title: 'Warning!',
                    message: 'No external interfaces found. Do you want to continue the setup?',
                    buttons: Ext.Msg.YESNO,
                    icon: Ext.Msg.QUESTION,
                    fn: function (btn) {
                        if (btn === 'yes') {
                            me.getView().up('window').down('#nextBtn').click();
                        } else {
                            // if no is pressed
                        }
                    }
                });
            }
            vm.set('wan', wan);
        },


        testConnectivity: function (testType, cb) {
            Ung.app.loading('Testing Connectivity...'.t());
            rpc.connectivityTester.getStatus(function (result, ex) {
                Ung.app.loading(false);
                if (ex) {
                    Ext.MessageBox.show({
                        title: 'Network Settings'.t(),
                        msg: 'Unable to complete connectivity test, please try again.'.t(),
                        width: 300,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.INFO
                    });
                    return;
                }

                // build test fail message if any
                var message = null;
                if (result.tcpWorking === false  && result.dnsWorking === false) {
                    message = 'Warning! Internet tests and DNS tests failed.'.t();
                } else if (result.tcpWorking === false) {
                    message = 'Warning! DNS tests succeeded, but Internet tests failed.'.t();
                } else if (result.dnsWorking === false) {
                    message = 'Warning! Internet tests succeeded, but DNS tests failed.'.t();
                } else {
                    message = null;
                }

                if (testType === 'manual') {
                    // on manual test just show the message
                    Ext.MessageBox.show({
                        title: 'Internet Status'.t(),
                        msg: message || 'Success!'.t(),
                        width: 300,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.INFO
                    });
                } else {
                    // on next step just move forward if no failures
                    if (!message) { cb(); return; }

                    // otherwise show a warning message
                    var warningText = message + '<br/><br/>' + 'It is recommended to configure valid internet settings before continuing. Try again?'.t();
                    Ext.Msg.confirm('Warning:'.t(), warningText, function (btn, text) {
                        if (btn === 'yes') { return; }
                        cb();
                    });
                }
            });

        },

        onSave: function (cb) {
            var me = this, vm = this.getViewModel(),
                wan = vm.get('wan');

            if (!wan) { cb(); return; }

            // validate any current form first
            if (!me.getView().isValid()) { return; }

            if (wan.v4ConfigType === 'AUTO' || wan.v4ConfigType === 'PPPOE') {
                wan.v4StaticAddress = null;
                wan.v4StaticPrefix = null;
                wan.v4StaticGateway = null;
                wan.v4StaticDns1 = null;
                wan.v4StaticDns2 = null;
            }
            if (wan.v4ConfigType === 'STATIC') {
                wan.v4NatEgressTraffic = true;
            }
            if (wan.v4ConfigType === 'PPPOE') {
                wan.v4NatEgressTraffic = true;
                wan.v4PPPoEUsePeerDns = true;
            }

            // save
            Ung.app.loading('Saving ...'.t());
            rpc.networkManager.setNetworkSettings(function (response, ex) {
                if (ex) { Util.handleException(ex); return; }
                me.testConnectivity(Ext.isFunction(cb) ? 'auto' : 'manual', function () {
                    cb();
                });
            }, vm.get('networkSettings'));
        }
    }





});
