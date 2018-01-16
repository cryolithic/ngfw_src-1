Ext.define('Ung.view.main.Main', {
    extend: 'Ext.panel.Panel',
    itemId: 'main',
    reference: 'main',

    controller: 'main',
    viewModel: {
        formulas: {
            reportsEnabled: function (get) {
                return (get('reportsInstalled') && get('reportsRunning'));
            }
        }
    },

    layout: 'card',
    border: false,
    bodyBorder: false,
    bind: {
        activeItem: '{activeItem}'
    },
    publishes: 'activeItem',

    items: [{
        xtype: 'ung-dashboard'
    }, {
        xtype: 'ung-apps'
    }, {
        xtype: 'ung-sessions'
    }, {
        xtype: 'toolbar',
        docked: 'top',
        padding: 5,
        style: {
            background: '#1B1E26'
        },
        defaults: {
            iconAlign: 'top',
            padding: 0
        },
        items: [{
            xtype: 'component',
            padding: '0 10',
            html: '<img src="' + '/images/BrandingLogo.png" style="height: 40px;"/>'
        }, {
            text: 'Dashboard'.t(),
            iconCls: 'x-fa fa-home',
            handler: function () { Ung.app.redirectTo('#'); }
        }, {
            text: 'Apps'.t(),
            iconCls: 'x-fa fa-th-large',
            handler: function () { Ung.app.redirectTo('#apps'); }
        }, {
            text: 'Config'.t(),
            iconCls: 'x-fa fa-cogs',
            handler: function () { Ung.app.redirectTo('#apps'); }
        }, {
            text: 'Reports'.t(),
            iconCls: 'x-fa fa-line-chart',
            handler: function () { Ung.app.redirectTo('#apps'); }
        }, {
            xtype: 'spacer',
            width: 20
        }, {
            text: 'Sessions'.t(),
            iconCls: 'x-fa fa-list',
            ui: 'confirm',
            handler: function () { Ung.app.redirectTo('#sessions'); }
        }, {
            text: 'Hosts'.t(),
            iconCls: 'x-fa fa-th-list',
            handler: function () { Ung.app.redirectTo('#apps'); }
        }, {
            text: 'Devices'.t(),
            iconCls: 'x-fa fa-desktop',
            handler: function () { Ung.app.redirectTo('#apps'); }
        }, {
            text: 'Users'.t(),
            iconCls: 'x-fa fa-users',
            handler: function () { Ung.app.redirectTo('#apps'); }
        }]
    }]
});
