Ext.define('Ung.view.main.Main', {
    extend: 'Ext.Panel',
    itemId: 'main',
    reference: 'main',

    controller: 'main',
    viewModel: {

    },

    layout: 'card',
    border: false,
    bodyBorder: false,
    bind: {
        activeItem: '{activeItem}'
    },
    publishes: 'activeItem',

    items: [
        { xtype: 'ung-dashboard' },
        { xtype: 'ung-config' },
        { xtype: 'ung-reports' },
        { xtype: 'ung-sessions' },
        {
            xtype: 'toolbar',
            // shadow: false,
            cls: 'nav',
            // docked: 'left',
            docked: 'top',
            zIndex: 9999,
            // padding: 5,
            // style: {
            //     background: '#1b1e26'
            // },
            defaults: {
                iconAlign: 'top',
                // padding: 0,
                // tooltip: {
                //     // align: 'l-r',
                //     // align: 'b-t',
                //     anchor: true,
                //     showDelay: 0,
                //     hideDelay: 0
                // }
            },
            items: [{
                xtype: 'component',
                margin: '0 20 0 0',
                html: '<img src="' + '/images/BrandingLogoWhite.png" style="height: 40px;"/>'
            }, {
                text: 'Dashboard'.t(),
                iconCls: 'x-fa fa-home',
                handler: function () { Ung.app.redirectTo('#'); }
            }, {
                text: 'Config'.t(),
                iconCls: 'x-fa fa-cog',
                // tooltip: { html: 'Config'.t() },
                handler: function () { Ung.app.redirectTo('#config'); }
            }, {
                text: 'Reports'.t(),
                iconCls: 'x-fa fa-area-chart',
                handler: function () { Ung.app.redirectTo('#reports'); }
            }, '->', {
                href: '#sessions',
                iconCls: 'monitor sessions',
                // bind: { userCls: '{activeItem === "sessions" ? "pressed" : ""}' }
            }, {
                href: '#hosts',
                iconCls: 'monitor hosts',
                bind: { userCls: '{activeItem === "hosts" ? "pressed" : ""}' }
            }, {
                href: '#devices',
                iconCls: 'monitor devices',
                bind: { userCls: '{activeItem === "devices" ? "pressed" : ""}' }
            }, {
                href: '#users',
                iconCls: 'monitor users',
                bind: { userCls: '{activeItem === "users" ? "pressed" : ""}' }
            }]
        }
    ],

    listeners: {
        resize: 'onResize'
    }

    // lbar: [{
    //     xtype: 'component',
    //     // padding: '0 10',
    //     html: '<img src="' + '/images/BrandingLogoWhite.png" style="height: 30px;"/>'
    // }, {
    //     // text: 'Dashboard'.t(),
    //     iconCls: 'x-fa fa-home fa-lg',
    //     handler: function () { Ung.app.redirectTo('#'); }
    // }, {
    //     // text: 'Config'.t(),
    //     iconCls: 'x-fa fa-cog fa-lg',
    //     handler: function () { Ung.app.redirectTo('#config'); }
    // }, {
    //     // text: 'Reports'.t(),
    //     iconCls: 'x-fa fa-area-chart fa-lg',
    //     handler: function () { Ung.app.redirectTo('#reports'); }
    // }]
});
