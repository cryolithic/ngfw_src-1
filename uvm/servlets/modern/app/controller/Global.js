Ext.define('Ung.controller.Global', {
    extend: 'Ext.app.Controller',
    namespace: 'Ung',

    stores: [
        'ConfigTree',
        'Policies',
        'Metrics',
        'Stats',
        'Widgets',
        'Sessions',
        'Hosts',
        'Devices',
        'Conditions',
        'Countries',
        'UnavailableApps',
        'Rule',
        'Reports',
        'ReportsTree',
        'Categories',
        'PoliciesTree'
    ],

    // listen: {
    //     global: {
    //         resize: 'onResize'
    //     }
    // },

    hashBackup: '', // used to revert the hash when user changes are detected in Apps or Configs

    config: {
        refs: {
            mainView: '#main',
            dashboardView: '#dashboard',
            appsView: '#apps',
            reportsView: '#reports',
            configView: '#config',
        },

        routes: {
            '': { action: 'onDashboard' },

            'config:params': {
                action: 'onConfig',
                conditions: {
                    ':params' : '(.*)'
                }
            },

            'reports:params': {
                action: 'onReports',
                conditions: {
                    ':params' : '(.*)'
                }
            },


            'sessions': { action: 'onSessions' },
            'sessions/:params': {
                action: 'onSessions',
                conditions: {
                    ':params' : '([0-9a-zA-Z.\?\&=\-]+)'
                }
            },
            'hosts': { action: 'onHosts' },
            'hosts/:params': {
                action: 'onHosts',
                conditions: {
                    ':params' : '([0-9a-zA-Z.\?\&=\-]+)'
                }
            },
            'devices': { action: 'onDevices' },
            'devices/:params': {
                action: 'onDevices',
                conditions: {
                    ':params' : '([0-9a-zA-Z.\?\&=\-]+)'
                }
            },
            'users': { action: 'onUsers' },
            'expert': 'setExpertMode',
            'noexpert': 'setNoExpertMode'
        },

        reportsEnabled: true
    },

    // onResize: function (width) {
    //     var screen;
    //     if (width > 750 ) { screen = 'WIDE'; }
    //     if (width <= 750 ) { screen = 'NARROW'; }
    //     this.getMainView().getViewModel().set({
    //         screen: screen
    //     });
    // },

    onDashboard: function () {
        this.getMainView().getViewModel().set('activeItem', 'ung-dashboard');
    },

    onConfig: function (params) {
        var me = this, mainView = me.getMainView(), configView = me.getConfigView(), config, view;
        mainView.getViewModel().set('activeItem', 'ung-config');

        configView.getViewModel().set('params', params);

        if (params) {
            config = params.split('/')[1];
            view = params.split('/')[2];
        }

        if (configView.down('#configCard')) {
            configView.remove('configCard');
        }

        if (config && view) {
            // configView.remove('ung-config-select');
            // configView.remove('configCard');
            if (configView.down('config-' + config)) {
                // if config card already exists activate it and select given view
                // mainView.getViewModel().set('activeItem', 'configCard');
                configView.down('config-' + config).setActiveItem('config-' + config + '-' + view || 0);
                // if(subView){
                //     var subViewTarget = viewTarget.down('tabpanel');
                //     if(subViewTarget){
                //         subViewTarget.setActiveTab(subView);
                //     }
                // }
                // return;
            } else {
                // console.log(mainView);
                // mainView.remove('configCard');
            }

            var tree = configView.down('treelist');
            var node = tree.getStore().findNode('href', window.location.hash);
            configView.getViewModel().set('ttl', node.get('text'));
            // mainView.setLoading(true);

            Ext.Loader.loadScript({
                url: 'script/config/' + config + '.js',
                onLoad: function () {
                    configView.add({
                        xtype: 'config-' + config,
                        name: config,
                        itemId: 'configCard',
                        activeItem: view ? 'config-' + config + '-' + view : 0,
                        // subTab: subView || 0,
                    });
                    // mainView.getViewModel().set('activeItem', 'configCard');
                    // mainView.getViewModel().notify();
                    // mainView.setLoading(false);
                }
            });
        } else {
            // configView.add({ xtype: 'ung-config-select' });
            if (configView.down('#configCard')) {
                configView.remove('configCard');
            }
        }
    },

    onReports: function (params) {
        var me = this, mainView = me.getMainView(), reportsView = me.getReportsView(), category, report;
        mainView.getViewModel().set('activeItem', 'ung-reports');

        if (params) {
            category = params.split('/')[1];
            report = params.split('/')[2];
        }

        if (reportsView.down('#reportsCard')) {
            reportsView.remove('reportsCard');
        }


        if (category && report) {
            // var tree = reportsView.down('treelist');
            var node = Ext.getStore('reportstree').findNode('url', window.location.hash.replace('#reports/', ''));
            // tree.setSelection(node);
            reportsView.getViewModel().set('params', true);
            reportsView.getViewModel().set('ttl', node.get('cat') + ' / ' + node.get('text'));
            // mainView.setLoading(true);
        } else {
            reportsView.getViewModel().set('params', false);
        }



        // // var reportsVm = this.getReportsView().getViewModel();
        // var hash = '';
        // if (categoryName) {
        //     hash += categoryName;
        // }
        // if (reportName) {
        //     hash += '/' + reportName;
        // }
        // reportsVm.set('hash', hash);
        // // this.getMainView().getViewModel().set('activeItem', 'reports');
    },

    onMonitor: function(id, xtype, params){
        var me = this,
            mainview = me.getMainView();

        var filter = null;
        if (params) {
            filter = {
                property: params.split('=')[0].replace('?', ''),
                value: params.split('=')[1],
                source: 'route'
            };
        }

        var existing = mainview.getComponent( id );
        if(existing){
            existing.routeFilter = filter;
            existing.fireEvent('refresh');
        }else{
            this.getMainView().add({
                xtype: xtype,
                itemId: id,
                routeFilter: filter
            });
        }
        this.getMainView().getViewModel().set('activeItem', id);

    },

    onSessions: function () {
        this.getMainView().getViewModel().set('activeItem', 'ung-sessions');
        // this.onMonitor( 'sessions', 'ung.sessions', params);
    },

    onHosts: function ( params ) {
        this.onMonitor( 'hosts', 'ung.hosts', params);
    },

    onDevices: function ( params ) {
        this.onMonitor( 'devices', 'ung.devices', params);
    },

    onUsers: function () {
        this.getMainView().add({
            xtype: 'ung.users',
            itemId: 'users'
        });
        this.getMainView().getViewModel().set('activeItem', 'users');
    },

    statics: {
        //
        // These two methods are used on tab panels with their own sub-tab panels and added
        // to the controller.  See openvon/server and virus-blocker/advanced.
        //
        onSubtabActivate: function(panel){
            var parentPanel = panel.up('apppanel') || panel.up('configpanel');
            var subTab = parentPanel.subTab;
            if(subTab == 0){
                return;
            }
            // Get the first child tabpanel (could be us!)
            while( (panel != null ) && ( panel.isXType('tabpanel') == false ) ){
                panel = panel.down('tabpanel');
            }
            if(panel){
                panel.setActiveItem(subTab);
            }
        },

        onBeforeSubtabChange: function (tabPanel, card, oldCard) {
            var hash = window.location.hash;
            var id = tabPanel.itemId;
            if( id && hash.indexOf(id) > -1 ){
                Ung.app.redirectTo(hash.substr(0,hash.indexOf(id) + id.length) + '/' + card.getItemId());
            }
        }

    }

});
