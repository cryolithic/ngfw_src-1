Ext.define('Ung.cmp.AppState', {
    extend: 'Ext.form.FieldSet',
    alias: 'widget.appstate',
    title: '<i class="fa fa-power-off"></i> ' + 'Power'.t(),

    padding: 10,
    margin: '20 0',
    cls: 'app-section',

    layout: {
        type: 'hbox',
        align: 'middle'
    },

    viewModel: {
        formulas: {
            appState: function (get) {
                var targetState = get('instance.targetState'),
                    runState = get('instance.runState');

                if ( ( targetState === 'RUNNING' ) &&
                     ( runState == 'RUNNING' ) ) {
                    return Ext.String.format('{0} is enabled.'.t(), get('props.displayName'));
                }else if( ( targetState == 'RUNNING' ) &&
                    ( runState != targetState ) ){
                    return Ext.String.format('{0} should be enabled but is not active.'.t(), get('props.displayName'));
                }
                return Ext.String.format('{0} is disabled.'.t(), get('props.displayName'));
            },
            appStateIcon: function (get) {
                var targetState = get('instance.targetState');
                var runState = get('instance.runState');
                if( !targetState ||
                    ( runState != targetState ) ){
                    return 'fa-orange';
                }
                if ( runState === 'RUNNING') {
                    return 'fa-green';
                }
                return 'fa-flip-horizontal fa-gray';
            },
            appStateTitle: function (get) {
                var targetState = get('instance.targetState');
                var runState = get('runState');
                var icon = '<i class="fa fa-power-off fa-gray"></i>';
                if (!targetState) {
                    icon =  '<i class="fa fa-power-off fa-orange"></i>';
                }
                if ( ( runState === 'RUNNING' ) &&
                     ( targetState === 'RUNNING' ) ) {
                    icon = '<i class="fa fa-power-off fa-green"></i>';
                }
                return icon + ' ' + 'Power'.t();
            }
        }
    },

    controller: {
        runStateMaxWait: 10000,
        runStateWait: 0,
        runStateDelay: 100,
        runStateWantState: null,
        runStateWantButton: null,
        runStateTask: null,

        onPower: function (btn) {
            var me = this,
                appManager = me.getView().up('#appCard').appManager,
                vm = me.getViewModel(),
                targetState = vm.get('instance.targetState'),
                runState = vm.get('instance.runState');

            btn.setDisabled(true);

            if( !me.runStateTask ){
                me.runStateTask = new Ext.util.DelayedTask( Ext.bind(function(){
                    appManager.getRunState( Ext.bind( function (result, ex2) {
                        if (ex2) {
                            Util.handleException(ex2);
                            return false;
                        }
                        this.runStateWait = this.runStateWait - this.runStateDelay;
                        if(result != this.runStateWantState){
                            this.runStateTask.delay( this.runStateDelay );
                        }else{
                            vm.set('instance.runState', result);
                            vm.set('instance.targetState', this.runStateWantState );
                            this.runStateButton.setDisabled(false);
                            // force reload Apps after start/stop within App Settings
                            rpc.appsViews = rpc.appManager.getAppsViews();
                            Ext.getStore('policies').loadData(rpc.appsViews);
                            Ung.app.getGlobalController().getAppsView().getController().getApps();

                            if (appManager.getAppProperties().name === 'reports') {
                                Ung.app.reportscheck();
                            }

                        }
                    }, this) );
                }, me) );
            }
            me.runStateWait = me.runStateMaxWait;
            me.runStateButton = btn;

            if ( ( targetState === 'RUNNING' ) &&
                 ( runState === 'RUNNING' ) ) {
                // stop app
                me.runStateWantState = 'INITIALIZED';
                appManager.stop(Ext.bind(function (result, ex) {
                    if (ex) {
                        Util.handleException(ex);
                        return false;
                    }
                    me.runStateTask.delay( this.runStateDelay );
                }, this) );
            } else {
                // start app
                me.runStateWantState = 'RUNNING';
                appManager.start(Ext.bind(function (result, ex) {
                    if (ex) {
                        Ext.Msg.alert('Error', ex.message);
                        // Likely due to an invalid licnese.
                        // Expect the app to shutdown
                        me.runStateWantState = 'INITIALIZED';
                        me.runStateTask.delay( this.runStateDelay );
                        btn.setDisabled(false);
                        return false;
                    }
                    me.runStateTask.delay( this.runStateDelay );
                }, this) );
            }
        }
    },

    items: [{
        xtype: 'button',
        cls: 'power-btn',
        bind: {
            iconCls: 'fa fa-toggle-on {appStateIcon} fa-2x'
        },
        handler: 'onPower'
    }, {
        xtype: 'component',
        padding: '3 5',
        bind: {
            html: '<strong>' + '{appState}' + '</strong>'
        }
    }, {
        xtype: 'component',
        html: '<i class="fa fa-spinner fa-spin fa-lg fa-fw"></i>',
        hidden: true,
        bind: {
            hidden: '{targetState}'
        }
    }]
});
