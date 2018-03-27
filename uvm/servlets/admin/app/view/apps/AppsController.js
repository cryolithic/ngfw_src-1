Ext.define('Ung.view.apps.AppsController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.apps',

    control: {
        '#': { afterrender: 'onAfterRender', activate: 'onActivate' },
        '#installableApps': { deactivate: 'onInstallableDeactivate' },
        '#installableApps > dataview': { select: 'onInstallApp' }
    },
    listen: {
        store: {
            '#policiestree': {
                rootchange: 'onRootChange'
            }
        },
        global: {
            // init: 'onInit',
            appremove: 'onRemoveApp',
            postregistration: 'onPostRegistration',
        }
    },

    // build the apps components and add them to the view
    onAfterRender: function () {
        var me = this;
        // maybe there is a better way to get all the available apps regardless of policy
        var initPolicy = rpc.appsViews[0]; // take the first policy (default)
        // build add all the apps containers (rack items) and only update them when based on selected policy

        var apps = [], appCmps = [], srvCmps = [];

        Ext.Array.each(initPolicy.appProperties.list, function (app) {
            apps.push(app);
        });

        apps = Ext.Array.sort(apps, function (a, b) {
            if (a.viewPosition < b.viewPosition) {
                return -1;
            }
            return 1;
        });

        Ext.Array.each(apps, function (app) {
            if (app.type === 'FILTER') {
                appCmps.push({
                    xtype: me.getView().itemType,
                    itemId: 'app_' + app.name,
                    app: app,
                    viewModel: { data: { app: app, instanceId: null, installing: false } }
                });
            }
            if (app.type === 'SERVICE') {
                srvCmps.push({
                    xtype: me.getView().itemType,
                    itemId: 'app_' + app.name,
                    app: app,
                    viewModel: { data: { app: app, instanceId: null, installing: false } }
                });
            }
        });

        me.getView().down('#_apps').add(appCmps);
        me.getView().down('#_services').add(srvCmps);

        var vm = this.getViewModel();

        vm.bind('{reportsAppStatus}', function () {
            Ext.getStore('policiestree').build();
            me.getApps();
        });

        // when policy changes get the apps, this is needed because
        vm.bind('{policyId}', function () {
            if (Ext.getStore('policiestree').getCount() > 0) {
                var policyNode = Ext.getStore('policiestree').findNode('policyId', vm.get('policyId'));
                if (policyNode) {
                    vm.set('policyName', policyNode.get('name'));
                    me.getApps();
                } else {
                    Ext.fireEvent('invalidquery');
                    // Ung.app.redirectTo('#apps/1'); // redirect to main policy if in apps view
                }
            }
        });

        // me.applyPolicy(initPolicy);
    },

    // when policy changes the apps components are updated based on this policy app instances/props
    applyPolicy: function(policy) {
        var me = this, vm = me.getViewModel(), appVm;

        me.getView().query(me.getView().itemType).forEach(function (app) {
            appVm = app.getViewModel();
            var instance = Ext.Array.findBy(policy.instances.list, function(instance) {
                return instance.appName === appVm.get('app.name');
            });
            if (instance) {
                var parentPolicy = null, metrics = null;
                if (instance.policyId && policy.policyId !== instance.policyId) {
                    parentPolicy = Ext.getStore('policiestree').findNode('policyId', instance.policyId).get('name');
                }
                if (policy.appMetrics.map[instance.id]) {
                    metrics = policy.appMetrics.map[instance.id].list;
                }
                appVm.set({
                    instanceId: instance.id,
                    targetState: instance.targetState,
                    state: policy.runStates.map[instance.id],
                    parentPolicy: parentPolicy,
                    metrics: metrics,
                    route: (appVm.get('app.type') === 'FILTER') ? '#apps/' + policy.policyId + '/' + appVm.get('app.name') : '#service/' + appVm.get('app.name'),
                    helpSource: rpc.helpUrl + '?fragment=apps/' + policy.policyId + '/' + appVm.get('app.name').replace(/ /g, '-') + '&' + Util.getAbout()
                });
            } else {
                appVm.set({
                    instanceId: null,
                    targetState: null,
                    state: null,
                    parentPolicy: null,
                    metrics: null,
                    route: null
                });
            }
            var license = policy.licenseMap.map[appVm.get('app.name')];
            var licenseMessage = Util.getLicenseMessage(license);
            //console.log("license: " + license + " licenseMessage: " + licenseMessage);
            appVm.set({
                license: license,
                licenseMessage: licenseMessage,
            });
        });

        // deal with installable apps
        var installableApps = [], installableServices = [];
        Ext.Array.each(policy.installable.list, function (appName) {
            var app = Ext.Array.findBy(policy.appProperties.list, function (a) {
                return a.name === appName;
            });
            app.desc = Util.appDescription[app.name];
            app.route = (app.type === 'FILTER') ? '#apps/' + policy.policyId + '/' + app.name : '#service/' + app.name;
            // app.parentPolicy = null;
            if (app.type === 'FILTER') {
                installableApps.push(app);
            } else {
                installableServices.push(app);
            }
        });
        vm.getStore('installableApps').loadData(installableApps);
        vm.getStore('installableServices').loadData(installableServices);
    },

    // check policy manager when activating apps view
    onActivate: function () {
        this.getViewModel().set('policyManagerInstalled', rpc.appManager.app('policy-manager') ? true : false);
    },


    // remove already finished installed apps when deactivating the view
    onInstallableDeactivate: function () {
        var me = this, vm = me.getViewModel();
        vm.getStore('installableApps').each(function (app) {
            if (app.get('extraCls') === 'finish') {
                app.drop();
            }
        });
    },

    // when policy id changes by selecting another policy from the tree, get the apps
    onRootChange: function () {
        var me = this, menuItems = [], vm = me.getViewModel();

        if (Ext.getStore('policiestree').getCount() > 0) {
            Ext.getStore('policiestree').each(function (node) {
                menuItems.push({
                    margin: '0 0 0 ' + (node.get('depth') - 1) * 20,
                    text: node.get('name'),
                    iconCls: node.get('iconCls'),
                    href: '#apps/' + node.get('policyId'),
                    // href: '#apps/' + node.get('slug'),
                    hrefTarget: '_self'
                });
            });

            menuItems.push('-');
            menuItems.push({
                text: 'Manage Policies',
                iconCls: 'fa fa-cog',
                href: '#service/policy-manager/policies',
                hrefTarget: '_self'
            });

            me.lookup('policyBtn').setMenu({
                plain: true,
                mouseLeaveDelay: 0,
                items: menuItems,
                listeners: {
                    click: function (menu, item) {
                        // for touch devices this hack is required
                        if (Ext.supports.Touch) {
                            Ung.app.redirectTo(item.href);
                        }
                    }
                }
            });

            var policyNode = Ext.getStore('policiestree').findNode('policyId', vm.get('policyId'));
            if (policyNode) {
                vm.set('policyName', policyNode.get('name'));
                vm.set('policyMenu', true);
            } else {
                Ung.app.redirectTo('#apps/1'); // redirect to main policy
            }
        } else {
            vm.set('policyMenu', false);
        }

        me.getApps(); // set when route changed
    },

    // actual method which fetches apps for a specific policy, then updates the components
    getApps: function () {
        var me = this, vm = this.getViewModel();

        // we need policies store before fetching apps
        if (Ext.getStore('policiestree').getCount() === 0) { return; }

        Rpc.asyncData('rpc.appManager.getAppsView', vm.get('policyId'))
            .then(function (policy) {
                me.applyPolicy(policy);
            });
    },

    // show installable apps card
    showInstall: function () {
        var me = this, vm = this.getViewModel();
        me.getView().setActiveItem('installableApps');
        vm.set('onInstalledApps', false);
    },

    // back to Apps from installable view
    backToApps: function () {
        var me = this, vm = this.getViewModel();
        me.getView().setActiveItem('installedApps');
        vm.set('onInstalledApps', true);
    },


    /**
     * method which initialize the app installation
     */
    onInstallApp: function (view, record) {
        var me = this, vm = me.getViewModel();
        if (!rpc.isRegistered) {
            Ext.fireEvent('openregister');
            return;
        }

        // used for installable components
        if (record.get('extraCls') === 'progress') {
            return;
        }

        var appVm = vm.getView().down('#app_' + record.get('name')).getViewModel();
        appVm.set({
            installing: true,
            parentPolicy: null
        });

        // used for installable components
        record.set('extraCls', 'progress');

        Rpc.asyncData('rpc.appManager.instantiate', record.get('name'), vm.get('policyId'))
            .then(function (result) {
                var instance = result.getAppSettings();

                appVm.set({
                    installing: false,
                    instanceId: instance.id,
                    targetState: instance.targetState,
                    state: result.getRunState(),
                    parentPolicy: null,
                    metrics: result.getMetrics().list,
                    route: (record.get('type') === 'FILTER') ? '#apps/' + instance.policyId + '/' + record.get('name') : '#service/' + record.get('name')
                });

                record.set('extraCls', 'finish');

                if (record.get('name') === 'reports') {
                    Ung.app.reportscheck();
                }

                if (record.get('name') === 'live-support') { // just reload the page for now
                    Ung.app.getMainView().getController().setLiveSupport();
                }

                if (record.get('name') === 'policy-manager') { // build the policies tree
                    Ext.getStore('policiestree').build();
                    vm.set('policyManagerInstalled', true);
                }

                // update policies to refresh instances
                Rpc.asyncData('rpc.appManager.getAppsViews')
                    .then(function (policies) {
                        Ext.getStore('policies').loadData(policies);
                    });

                Ext.fireEvent('appinstall');
            });
    },

    onRemoveApp: function () {
        // just refresh apps to avoid any possible issues with rendering apps from parent policies
        Ung.app.getMainView().getController().setLiveSupport();
        this.getApps();
    },

    // basic power handler for the rack item
    powerHandler: function (btn) {
        var me = this, appVm = btn.up(me.getView().itemType).getViewModel(),
            appInstanceId = appVm.get('instanceId'), appManager;

        // supress clicking if operation pending
        if (btn.hasCls('pending')) {
            return;
        }

        btn.setUserCls('pending');

        if (appInstanceId) {
            Rpc.asyncData('rpc.appManager.app', appInstanceId)
                .then(function (result) {
                    appManager = result;
                    if (appVm.get('targetState') !== 'RUNNING') {
                        appManager.start(function (result, ex) {
                            btn.setUserCls('');
                            if (ex) {
                                if (ex.message) {
                                    Ext.Msg.alert('Warning'.t(), ex.message);
                                } else {
                                    Util.handleException(ex);
                                }
                                return;
                            }
                            rpc.appsViews= rpc.appManager.getAppsViews();
                            Ext.getStore('policies').loadData(rpc.appsViews);
                            Ung.app.getGlobalController().getAppsView().getController().getApps();
                        });
                    } else {
                        appManager.stop(function (result, ex) {
                            btn.setUserCls('');
                            if (ex) { Util.handleException(ex); return; }
                            appVm.set({
                                metrics: null
                            });
                            rpc.appsViews= rpc.appManager.getAppsViews();
                            Ext.getStore('policies').loadData(rpc.appsViews);
                            Ung.app.getGlobalController().getAppsView().getController().getApps();
                        });
                    }
                }, function (ex) {
                    Util.handleException(ex);
                });
        }
    },


    // used for installing recommended apps after registering
    onPostRegistration: function () {
        var me = this;
        Ung.app.redirectTo('#apps');

        var popup = Ext.create('Ext.window.MessageBox', {
            buttons: [{
                name: 'Yes',
                text: 'Yes, install the recommended apps.'.t(),
                handler: function () {
                    var apps = [
                        { displayName: 'Web Filter', name: 'web-filter'},
                        { displayName: 'Bandwidth Control', name: 'bandwidth-control'},
                        { displayName: 'SSL Inspector', name: 'ssl-inspector'},
                        { displayName: 'Application Control', name: 'application-control'},
                        { displayName: 'Captive Portal', name: 'captive-portal'},
                        { displayName: 'Firewall', name: 'firewall'},
                        { displayName: 'Reports', name: 'reports'},
                        { displayName: 'Policy Manager', name: 'policy-manager'},
                        { displayName: 'Directory Connector', name: 'directory-connector'},
                        { displayName: 'IPsec VPN', name: 'ipsec-vpn'},
                        { displayName: 'OpenVPN', name: 'openvpn'},
                        { displayName: 'Tunnel VPN', name: 'tunnel-vpn'},
                        { displayName: 'Configuration Backup', name: 'configuration-backup'},
                        { displayName: 'Branding Manager', name: 'branding-manager'},
                        { displayName: 'Live Support', name: 'live-support'}];

                    // only install WAN failover/balancer apps if more than 2 interfaces
                    try {
                        if (rpc.networkSettings.interfaces.list.length > 2) {
                            apps.push({ displayName: 'WAN Failover', name: 'wan-failover'});
                            apps.push({ displayName: 'WAN Balancer', name: 'wan-balancer'});
                        }
                    } catch (e) {
                        console.log(e);
                    }

                    // only install these if enough memory
                    // or if its arm still install virus blocker (in clientless mode)
                    try {
                        var memTotal = Util.bytesToMBs(Ext.getStore('stats').first().get('MemTotal'));
                        if (memTotal && memTotal > 900) {
                            apps.splice(2, 0, { displayName: 'Phish Blocker', name: 'phish-blocker'});
                            apps.splice(2, 0, { displayName: 'Spam Blocker', name: 'spam-blocker'});
                            apps.splice(2, 0, { displayName: 'Virus Blocker Lite', name: 'virus-blocker-lite'});
                            apps.splice(2, 0, { displayName: 'Virus Blocker', name: 'virus-blocker'});
                        } else if (rpc.architecture == 'arm') {
                            apps.splice(2, 0, { displayName: 'Virus Blocker', name: 'virus-blocker'});
                        }
                    } catch (e) {
                        console.log(e);
                    }

                    popup.close();
                    me.installRecommendedApps(apps);
                }
            }, {
                name: 'No',
                text: 'No, I will install the apps manually.',
                handler: function () {
                    popup.close();
                    me.getView().setActiveItem('installableApps');
                }
            }]
        });

        popup.show({
            title: 'Registration complete.'.t(),
            width: 470,
            msg: 'Thank you for using Untangle!'.t() + '<br/><br/>' +
                'Applications can now be installed and configured.'.t() + '<br/>' +
                'Would you like to install the recommended applications now?'.t(),
            icon: Ext.MessageBox.QUESTION
        });
    },

    installRecommendedApp: function (app, cb) {
        var me = this, vm = me.getViewModel();
        var appVm = vm.getView().down('#app_' + app.name).getViewModel();
        appVm.set('installing', true);

        Rpc.asyncData('rpc.appManager.instantiate', app.name, vm.get('policyId'))
            .then(function (result) {
                var instance = result.getAppSettings();
                appVm.set({
                    installing: false,
                    instanceId: instance.id,
                    targetState: instance.targetState,
                    state: result.getRunState(),
                    parentPolicy: null,
                    metrics: result.getMetrics().list,
                    route: (appVm.get('app.type') === 'FILTER') ? '#apps/' + instance.policyId + '/' + appVm.get('app.name') : '#service/' + appVm.get('app.name')
                });
                cb();
            });
    },

    installRecommendedApps: function (apps) {
        var me = this, appsToInstall = apps.length;

        Ext.Array.each(apps, function (app) {
            me.installRecommendedApp(app, function () {
                appsToInstall--;
                if (appsToInstall === 0) { // all apps installed
                    Ext.MessageBox.alert('Installation Complete!'.t(),
                        'The recommended applications have successfully been installed.'.t()  + '<br/><br/>' +
                        'Thank you for using Untangle!'.t(),
                        function () {
                            window.location.href = '/admin/index.do';
                        });
                    return;
                }
            });
        });
    }

});
