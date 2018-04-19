Ext.define('Ung.Setup.Complete', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.Complete',

    title: 'Complete'.t(),
    description: 'Complete'.t(),

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
