Ext.define('Ung.Setup.InternetConnection', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.internetconnection',

    title: 'Internet Connection'.t(),

    dockedItems: [{
        xtype: 'component',
        cls: 'step-title',
        padding: 10,
        dock: 'top',
        background: '#FFF',
        html: 'Configure the Internet Connection'.t()
    }],

    layout: 'fit',

    items: [{
        xtype: 'container',
        html: 'Internet Connection'
    }],

    listeners: {
        save: 'onSave'
    },

    controller: {
        onSave: function (cb) {
            cb();
        }
    }





});
