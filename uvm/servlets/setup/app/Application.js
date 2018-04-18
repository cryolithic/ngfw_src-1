// test
Ext.define('Ung.Setup', {
    extend: 'Ext.app.Application',
    namespace: 'Ung',
    autoCreateViewport: false,
    name: 'Ung',
    rpc: null,
    // controllers: ['Global'],
    mainView: 'Ung.Setup.Main',

    loading: function (msg) {
        this.getMainView().down('window').setLoading(msg);
    }
});
