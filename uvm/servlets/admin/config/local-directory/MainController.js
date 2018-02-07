Ext.define('Ung.config.local-directory.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.config-local-directory',
    alternateClassName: 'Ung.config.localdirectory.MainController',

    control: {
        '#': {
            beforerender: 'loadSettings'
        }
    },

    loadSettings: function () {
        var me = this, v = me.getView(), vm = me.getViewModel();

        v.setLoading(true);
        Ext.Deferred.sequence([
            Rpc.directPromise('rpc.UvmContext.localDirectory.getUsers')
            ], this).then(function (result) {
                if(Util.isDestroyed(vm)){
                    return;
                }
                // set the local record fields we use to deal with the expiration time and add vs edit logic
                var users = result[0];
                for(var i = 0 ; i < users.list.length ; i++) {
                    users.list[i].localEmpty = false;

                    if (users.list[i].expirationTime == 0) {
                        users.list[i].localExpires = new Date();
                        users.list[i].localForever = true;
                    }else {
                        users.list[i].localExpires = new Date(users.list[i].expirationTime);
                        users.list[i].localForever = false;
                    }
                }

                vm.set('usersData', users);
        }, function(ex) {
            if(!Util.isDestroyed(vm)){
                vm.set('panel.saveDisabled', true);
            }
        }).always(function() {
            if(Util.isDestroyed(v)){
                return;
            }
            v.setLoading(false);
        });
    },

    saveSettings: function () {
        var me = this, v = me.getView(), vm = me.getViewModel();

        if (!Util.validateForms(v)) {
            return;
        }

        v.setLoading(true);
        v.query('ungrid').forEach(function (grid) {
            var store = grid.getStore();

            /**
             * Important!
             * update custom grids only if are modified records or it was reordered via drag/drop
             */
            if (store.getModifiedRecords().length > 0 || store.isReordered) {
                store.each(function (record) {
                    if (record.get('markedForDelete')) {
                        record.drop();
                    }
                });
                store.isReordered = undefined;
                vm.set(grid.listProperty, Ext.Array.pluck(store.getRange(), 'data'));
            }
        });

        var userlist = vm.get('usersData');
        var user;

        for(var i = 0 ; i < userlist.list.length ; i++) {
            user = userlist.list[i];

            if(user.password == null) user.password = "";

            // calculate the passwordBase64Hash for any changed passwords and remove cleartext
            if(user.password.length > 0) {
                user.passwordBase64Hash = Util.base64encode(user.password);
                user.password = "";
            }

            // use localForever and localExpires to set the correct expirationTime
            if (user.localForever == true) {
                user.expirationTime = 0;
            } else {
                user.expirationTime = user.localExpires.getTime();
            }
        }

        Ext.Deferred.sequence([
            Rpc.asyncPromise('rpc.UvmContext.localDirectory.setUsers', userlist)
            ], this).then(function (result) {
                if(Util.isDestroyed(v, me)){
                    return;
                }
                v.setLoading(false);
                Ext.fireEvent('resetfields', v);
                me.loadSettings();
        }, function (ex) {
            if(!Util.isDestroyed(vm)){
                vm.set('panel.saveDisabled', true);
            }
        }).always(function() {
            if(Util.isDestroyed(v)){
                return;
            }
            v.setLoading(false);
        });
    },

    statics:{
        expirationRenderer: function( value ){
            return(value > 0 ? Renderer.timestamp(value) : 'Never'.t());
        }
    }

});
