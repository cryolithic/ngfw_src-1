Ext.define('Ung.view.main.Main', {
    extend: 'Ext.panel.Panel',
    itemId: 'main',
    reference: 'main',

    // controller: 'main',
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
    // bind: {
    //     activeItem: '{activeItem}'
    // },
    // publishes: 'activeItem',

    items: [{
        xtype: 'ung-dashboard'
    }, {
        // xtype: 'ung.apps'
    }, {
        // xtype: 'ung.config'
    }, {
        // xtype: 'ung.reports'
    }],

    tbar: [{
        xtype: 'component',
        html: '<img src="' + '/images/BrandingLogo.png" style="height: 40px;"/>'
        // margin: 0,
        // padding: 0,
        // href: '#'
    }, {
        text: 'Dashboard'.t(),
        iconCls: 'fa fa-home'
    }, {
        text: 'Apps'.t(),
        iconCls: 'fa fa-th'
    }]
});
