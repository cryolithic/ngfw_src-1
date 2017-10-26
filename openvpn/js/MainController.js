Ext.define('Ung.apps.openvpn.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.app-openvpn',

    control: {
        '#': {
            afterrender: 'getSettings'
        }
    },

    getActiveClients: function () {
        var grid = this.getView().down('#activeClients'),
            vm = this.getViewModel();
        grid.setLoading(true);
        this.getView().appManager.getActiveClients(function (result, ex) {
            grid.setLoading(false);
            if (ex) { Util.handleException(ex); return; }
            vm.set('clientStatusData', result.list);
        });
    },

    getActiveServers: function () {
        var grid = this.getView().down('#remoteServers'),
            vm = this.getViewModel();
        grid.setLoading(true);
        this.getView().appManager.getRemoteServersStatus(function (result, ex) {
            grid.setLoading(false);
            if (ex) { Util.handleException(ex); return; }
            vm.set('serverStatusData', result.list);
        });
    },

    getSettings: function () {
        var me = this, v = this.getView(), vm = this.getViewModel();
        v.setLoading(true);
        v.appManager.getSettings(function (result, ex) {
            v.setLoading(false);
            if (ex) { Util.handleException(ex); return; }

            // set a flag on existing users to prevent changing the name
            for(var i = 0 ; i < result.remoteClients.list.length ; i++) {
                result.remoteClients.list[i].existing = true;
            }

            vm.set('settings', result);
        });

        // trigger active clients/servers fetching when instance run state changes
        vm.bind('{instance.runState}', function (runstate) {
            // get clients and servers only when instance is RUNNING
            if (runstate === 'RUNNING') {
                me.getActiveClients();
                me.getActiveServers();
            } else {
            // if not RUNNING, empty clients/servers grid
                vm.set({
                    clientStatusData: [],
                    serverStatusData: []
                });
            }
        });
    },

    setSettings: function () {
        var me = this, v = this.getView(), vm = this.getViewModel();

        if (!Util.validateForms(v)) {
            return;
        }

        if (me.validateSettings() != true) return;

        v.query('ungrid').forEach(function (grid) {
            var store = grid.getStore();
            if (store.getModifiedRecords().length > 0 ||
                store.getNewRecords().length > 0 ||
                store.getRemovedRecords().length > 0 ||
                store.isReordered) {
                store.each(function (record) {
                    if (record.get('markedForDelete')) {
                        record.drop();
                    }
                });
                store.isReordered = undefined;
                vm.set(grid.listProperty, Ext.Array.pluck(store.getRange(), 'data'));
            }
        });

        v.setLoading(true);
        v.appManager.setSettings(function (result, ex) {
            v.setLoading(false);
            if (ex) { Util.handleException(ex); return; }
            Util.successToast('Settings saved');
            me.getSettings();
            Ext.fireEvent('resetfields', v);
        }, vm.get('settings'));
    },

    validateSettings: function() {
        var me = this, v = this.getView(), vm = this.getViewModel();

        var clientStore = v.query('app-openvpn-remote-clients-grid')[0].getStore();
        var groupStore = v.query('app-openvpn-groups-grid')[0].getStore();
        var message = "";
        var problem = 0;
        var counter = 0;
        var clientNames = {};
        var groupNames = {};

        // make sure they don't try to delete all groups
        counter = 0;
        groupStore.each(function(record) {
            if (!record.get('markedForDelete')) counter++;
        });

        if ((counter == 0) && (groupStore.data.length > 0)) {
            groupStore.each(function(record) {
                record.set('markedForDelete', false);
            });
            problem++;
            Ext.MessageBox.alert("Delete Group Failed".t(), "There must be at least one group.".t());
        }
        if (problem != 0) return(false);

        // make sure they don't try to delete a group with active remote clients
        groupStore.each(function(record) {
            if (record.get('markedForDelete')) {
                var finder = clientStore.findRecord('groupId' , record.get('groupId'));
                if ((finder != null) && (!finder.get('markedForDelete'))) {
                    message = Ext.String.format("The group: {0} cannot be deleted because it is being used by the client: {1} in the Remote Clients list.".t(), record.get('name'), finder.get('name'));
                    record.set('markedForDelete', false);
                    problem++;
                    Ext.MessageBox.alert("Delete Group Failed".t(), message);
                }
            }
        });
        if (problem != 0) return(false);

        // check for duplicate client names
        counter = 1;
        clientStore.each(function(record) {
            var clientName = record.get('name');
            if (clientNames[clientName] != null) {
                message = Ext.String.format("The client name: {0} in row: {1} already exists.", clientName, counter);
                problem++;
                Ext.MessageBox.alert("Add Remote Client Failed".t(), message);
            }
            if (! record.get('markedForDelete')) clientNames[clientName] = true;
            counter++;
        });
        if (problem != 0) return(false);

        // check for duplicate group names
        counter = 1;
        groupStore.each(function(record) {
            var groupName = record.get('name');
            if (groupNames[groupName] != null) {
                message = Ext.String.format("The group name: {0} in row: {1} already exists.", groupName, counter);
                problem++;
                Ext.MessageBox.alert("Add Group Failed".t(), message);
            }
            if (! record.get('markedForDelete')) groupNames[groupName] = true;
            counter++;
        });
        if (problem != 0) return(false);

        // we must not allow port 443 or Apache will get very upset
        var pfield = Ext.ComponentQuery.query('textfield[fieldIndex=listenPort]')[0];
        var pvalue = pfield.getValue();
        if (pvalue === '443') {
            Ext.MessageBox.alert("Invalid Port".t(), "The configured port value is reserved. Please enter a different value.".t());
            return(false);
        }

        return(true);
    },

    uploadFile: function(cmp) {
        var me = this, v = this.getView(), vm = this.getViewModel();
        var form = Ext.ComponentQuery.query('form[name=upload_form]')[0];
        var file = Ext.ComponentQuery.query('textfield[name=uploadConfigFileName]')[0].value;
        if ( file == null || file.length === 0 ) {
            Ext.MessageBox.alert('Select File'.t(), 'Please choose a file to upload.'.t());
            return;
        }
        Ext.MessageBox.wait("Uploading File...".t(), "Please Wait".t());
        form.submit({
            url: "/openvpn/uploadConfig",
            success: Ext.bind(function( form, action ) {
                Ext.MessageBox.hide();
                Ext.MessageBox.alert('Success'.t(), 'The configuration has been imported.'.t());
                me.getSettings();
            }, this),
            failure: Ext.bind(function( form, action ) {
                Ext.MessageBox.hide();
                Ext.MessageBox.alert('Failure'.t(), 'Import failure'.t() + ": " + action.result.code);
            }, this)
        });
    },

    configureAuthenticationMethod: function (btn) {
        var vm = this.getViewModel();
        var policyId = vm.get('policyId');
        var authType = this.getViewModel().get('settings.authenticationType');
        var dircon = rpc.appManager.app('directory-connector');

        switch (authType) {
            case 'LOCAL_DIRECTORY':
                Ung.app.redirectTo('#config/local-directory');
                break;
            case 'RADIUS':
                if (dircon == null) this.showMissingServiceWarning();
                else Ung.app.redirectTo('#apps/' + policyId + '/directory-connector/radius');
                break;
            case 'ACTIVE_DIRECTORY':
                if (dircon == null) this.showMissingServiceWarning();
                else Ung.app.redirectTo('#apps/' + policyId + '/directory-connector/active-directory');
                break;
            case 'ANY_DIRCON':
                if (dircon == null) this.showMissingServiceWarning();
                else Ung.app.redirectTo('#apps/' + policyId + '/directory-connector');
                break;
            default: return;
        }
    }

});

Ext.define('Ung.apps.openvpn.SpecialGridController', {
    extend: 'Ung.cmp.GridController',
    alias: 'controller.app-openvpn-special',

    downloadClient: function(view, row, colIndex, item, e, record) {
        if( record.dirty ){
            Ext.MessageBox.alert(
                "Cannot download".t(),
                "Remote Client information has been modified.  You must Save before downloading the client.".t()
            );
            return;
        }
        var me = this, v = this.getView(), vm = this.getViewModel();
        me.getDistributeWindow().populate(record);
    },

    getDistributeWindow: function() {
        this.distributeWindow = Ext.create('Ext.window.Window', {
            title: 'Download OpenVPN Client'.t(),
            items: [{
                xtype: 'panel',
                items: [{
                    xtype: 'fieldset',
                    title: 'Download'.t(),
                    margin: 10,
                    defaults: { margin: 10 },
                    items: [{
                        xtype: 'component',
                        html: 'These files can be used to configure your Remote Clients.'.t(),
                    }, {
                        xtype: 'component',
                        name: 'downloadWindowsInstaller',
                        html:  " "
                    }, {
                        xtype: 'component',
                        name: 'downloadGenericConfigurationFile',
                        html: " "
                    }, {
                        xtype: 'component',
                        name: 'downloadUntangleConfigurationFile',
                        html: " "
                    }, {
                        xtype: 'component',
                        html: '<BR>'
                    }, {
                        xtype: 'component',
                        html: 'This file can be used to configure Chromebook clients.  On the target device, browse to <b>chrome://net-internals#chromeos</b> and use Import ONC file.'.t(),
                    }, {
                        xtype: 'component',
                        name: 'downloadChromebookConfigurationFile',
                        html: " "
                    }]
                }]
            }],
            bbar: ['->', {
                name: 'close',
                iconCls: 'cancel-icon',
                text: 'Close'.t(),
                handler: function() {
                    this.distributeWindow.close();
                },
                scope: this
            }],
            closeWindow: function() {
                this.destroy();
            },
            populate: function( record ) {
                this.record = record;
                this.setTitle('Download OpenVPN Client'.t() + ' | ' + record.data.name);

                var windowsLink = this.down('[name="downloadWindowsInstaller"]');
                var untangleLink = this.down('[name="downloadUntangleConfigurationFile"]');
                var genericLink = this.down('[name="downloadGenericConfigurationFile"]');
                var chromebookLink = this.down('[name="downloadChromebookConfigurationFile"]');

                windowsLink.update('Loading...'.t());
                genericLink.update('Loading...'.t());
                untangleLink.update('Loading...'.t());
                chromebookLink.update('Loading...'.t());

                Ext.MessageBox.wait("Building OpenVPN Client...".t(), "Please Wait".t());
                var openvpnApp = rpc.appManager.app('openvpn');
                var loadSemaphore = 3;

                openvpnApp.getClientDistributionDownloadLink( Ext.bind(function(result, exception) {
                    if (exception) { Util.handleException(exception); return; }
                    windowsLink.update('&bull;&nbsp;<a href="'+result+'" target="_blank">'+'Click here to download this client\'s Windows setup.exe file.'.t() + '</a>');
                    if(--loadSemaphore == 0) { Ext.MessageBox.hide();}
                }, this), this.record.data.name, "exe" );

                openvpnApp.getClientDistributionDownloadLink( Ext.bind(function(result, exception) {
                    if (exception) { Util.handleException(exception); return; }
                    genericLink.update('&bull;&nbsp;<a href="'+result+'" target="_blank">'+'Click here to download this client\'s configuration zip file for remote Untangle OpenVPN clients or other OS\'s (apple/linux/etc).'.t() + '</a>');
                    if(--loadSemaphore == 0) { Ext.MessageBox.hide();}
                }, this), this.record.data.name, "zip" );

                openvpnApp.getClientDistributionDownloadLink( Ext.bind(function(result, exception) {
                    if (exception) { Util.handleException(exception); return; }
                    untangleLink.update('&bull;&nbsp;<a href="'+result+'" target="_blank">'+'Click here to download this client\'s configuration as a single ovpn file with all certificates included inline.'.t() + '</a>');
                    if(--loadSemaphore == 0) { Ext.MessageBox.hide();}
                }, this), this.record.data.name, "ovpn" );

                openvpnApp.getClientDistributionDownloadLink( Ext.bind(function(result, exception) {
                    if (exception) { Util.handleException(exception); return; }
                    chromebookLink.update('&bull;&nbsp;<a href="'+result+'" target="_blank">'+'Click here to download this client\'s configuration onc file for Chromebook.'.t() + '</a>');
                    if(--loadSemaphore == 0) { Ext.MessageBox.hide();}
                }, this), this.record.data.name, "onc" );
            }
        });

        this.distributeWindow.show();
        return this.distributeWindow;
    },

});
