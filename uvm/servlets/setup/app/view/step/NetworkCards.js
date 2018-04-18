Ext.define('Ung.Setup.NetworkCards', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.networkcards',

    title: 'Network Cards'.t(),

    dockedItems: [{
        xtype: 'component',
        cls: 'step-title',
        padding: 10,
        dock: 'top',
        background: '#FFF',
        html: 'Identify Network Cards'.t()
    }],

    items: [{
        xtype: 'container',
        html: 'Network Cards'
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
