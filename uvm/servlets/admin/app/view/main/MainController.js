Ext.define('Ung.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',

    control: {
        '#': {
            beforerender: 'onBeforeRender'
        }
    },

    listen: {
        global: {
            afterlaunch: 'afterLaunch',
            openregister: 'openRegister'
            // onreports: 'onReports'
        }
    },

    afterLaunch: function () {
        this.checkRegister();
        this.checkNotifications();
    },

    checkRegister: function () {
        var me = this;
        if(!rpc.isRegistered) {
            // Ext.MessageBox.wait('Determining Connectivity...'.t(), 'Please wait'.t());
            rpc.UvmContext.isStoreAvailable(function (result, ex) {
                if (ex) { Util.handleException(ex); }
                // Ext.MessageBox.hide();

                // If box is not online - show error message.
                // Otherwise show registration screen
                if (!result) {
                    me.openOffline();
                } else {
                    me.openRegister();
                }
            });
        }
    },

    openRegister: function () {
        var regView = Ext.create('Ung.view.main.Registration', {});
        regView.show();
    },

    openOffline: function () {
        var offView = Ext.create('Ung.view.main.Offline', {});
        offView.show();
    },

    checkNotifications: function () {
        var me = this;
        Rpc.asyncData('rpc.notificationManager.getNotifications')
            .then(function (result) {
                var btn = me.getView().down('#notificationBtn'), notificationArr = '', i;

                if (result != null && result.list.length > 0) {
                    btn.show();
                    notificationArr += '<h3>' + 'Notifications:'.t() + '</h3><ul>';
                    for (i = 0; i < result.list.length; i += 1) {
                        notificationArr += '<li>' + result.list[i] + '</li>';
                    }
                    notificationArr += '</ul>';
                    btn.setText(result.list.length);
                } else {
                    btn.hide();
                    return;
                }

                btn.setMenu({
                    cls: 'notification-menu',
                    plain: true,
                    shadow: false,
                    width: 300,
                    items: [{
                        xtype: 'component',
                        padding: '20',
                        style: {
                            color: '#CCC'
                        },
                        autoEl: {
                            html: notificationArr
                        }
                    }, {
                        xtype: 'button',
                        iconCls: 'fa fa-question-circle',
                        text: 'Help with Administration Notifications'.t(),
                        margin: '0 20 20 20',
                        href: rpc.helpUrl + '?source=admin_notifications' + '&' + Util.getAbout(),
                        hrefTarget: '_blank'
                    }]
                });
            }, function (ex) {
                Util.handleException(ex);
            });
    },




    init: function (view) {
        var vm = view.getViewModel();
        // //view.getViewModel().set('widgets', Ext.getStore('widgets'));
        // vm.set('reports', Ext.getStore('reports'));
        vm.set('policyId', 1);
    },

    onBeforeRender: function(view) {
        var me = this,
            vm = view.getViewModel();
        me.setLiveSupport();
    },

    setLiveSupport: function() {
        this.getViewModel().set('liveSupport', rpc.appManager.app('live-support') !== null);
    },

    helpHandler: function (btn) {
        var helpUrl = rpc.helpUrl + '?fragment=' + window.location.hash.substr(1) + '&' + Util.getAbout();
        window.open(helpUrl);
    },

    supportHandler: function (btn) {
        var me = this;
        // check here if support is enabled and show modal only if not, otherwise open support window
        if (rpc.systemManager.getSettings().supportEnabled) {
            me.supportLaunch();
        } else {
            me.getView().add({ xtype: 'support' }).show();
        }
    },

    supportLaunch: function () {
        var supportUrl = Util.getStoreUrl() + '?action=support&' + Util.getAbout() + '&fragment=' + window.location.hash.substr(1) + '&line=ngfw';
        var user = rpc.adminManager.getSettings().users.list[0];
        if (user) {
            supportUrl += '&email=' + user.emailAddress;
        }
        window.open(supportUrl);
    }
});
