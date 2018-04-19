Ext.define('Ung.Setup.AutoUpgrades', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.AutoUpgrades',

    title: 'Auto Upgrades'.t(),
    description: 'Auto Upgrades'.t(),

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
