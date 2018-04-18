Ext.define('Ung.Setup.AutoUpgrades', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.autoupgrades',

    title: 'Auto Upgrades'.t(),

    dockedItems: [{
        xtype: 'component',
        cls: 'step-title',
        padding: 10,
        dock: 'top',
        background: '#FFF',
        html: 'Auto Upgrades'.t()
    }],

    layout: 'fit',

    items: [{
        xtype: 'container',
        html: 'Auto Upgrades'
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
