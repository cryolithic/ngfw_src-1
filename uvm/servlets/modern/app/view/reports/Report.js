Ext.define('Ung.report.Report', {
    extend: 'Ext.Container',
    alias: 'widget.report',

    layout: 'card',

    viewModel: {},

    items: [
        { xtype: 'timegraph' },
        { xtype: 'piegraph' }
    ],

    listeners: {
        initialize: 'onPainted',
        deactivate: 'onDeactivate'
        // activate: 'onActivate'
    },

    controller: {
        onPainted: function () {
            var me = this, vm = me.getViewModel();

            vm.bind('{entry}', function (entry) {
                console.log(entry);
            });

        }
    }
});
