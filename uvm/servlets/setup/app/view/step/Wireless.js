Ext.define('Ung.Setup.Wireless', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.wireless',

    title: 'Wirless'.t(),

    dockedItems: [{
        xtype: 'component',
        cls: 'step-title',
        padding: 10,
        dock: 'top',
        background: '#FFF',
        html: 'Configure Wireless Settings'.t()
    }],

    layout: 'fit',

    items: [{
        xtype: 'container',
        html: 'Wireless'
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
