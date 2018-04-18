Ext.define('Ung.Setup.InternalNetwork', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.internalnetwork',

    title: 'Internal Network'.t(),

    dockedItems: [{
        xtype: 'component',
        cls: 'step-title',
        padding: 10,
        dock: 'top',
        background: '#FFF',
        html: 'Configure the Internal Network Interface'.t()
    }],

    layout: 'fit',

    items: [{
        xtype: 'container',
        html: 'Internal Network Interface'
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
