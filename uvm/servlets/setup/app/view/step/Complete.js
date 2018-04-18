Ext.define('Ung.Setup.Complete', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.complete',

    title: 'Complete'.t(),

    dockedItems: [{
        xtype: 'component',
        cls: 'step-title',
        padding: 10,
        dock: 'top',
        background: '#FFF',
        html: 'Complete'.t()
    }],

    layout: 'fit',

    items: [{
        xtype: 'container',
        html: 'Complete'
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
