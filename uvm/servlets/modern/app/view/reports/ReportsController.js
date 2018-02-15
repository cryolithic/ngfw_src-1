Ext.define('Ung.view.reports.ReportsController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.reports',

    onInitialize: function () {
        // Ext.getStore('reportstree').build();
    },

    // onActivate: function () {
    //     console.log('activate');
    // },

    onSelectionChange: function (el, node) {
        var me = this, record, view = me.getView(), vm = me.getViewModel();
        if (!node || !node.get('url')) { return; }
        Ung.app.redirectTo('#reports/' + node.get('url'));

        if (node.isLeaf()) {
            record = Ext.getStore('reports').findRecord('url', node.get('url'), 0, false, true, true);
            if (record) {
                console.log('here');
                vm.set('entry', record);
                vm.notify();
            }
        }

        // me.lookup('eventreport').setHtml('event report deselected');
        // me.lookup('graphreport').setHtml('graph report deselected');
        // me.lookup('textreport').setHtml('text report deselected');

        // switch(record.get('type')) {
        // case 'EVENT_LIST': me.lookup('eventreport').setHtml('event report selected'); break;
        // case 'TIME_GRAPH':
        // case 'PIE_GRAPH':
        // case 'TIME_GRAPH_DYNAMIC': me.lookup('graphreport').setHtml('graph report selected'); break;
        // case 'TEXT': me.lookup('textreport').setHtml('text report selected'); break;
        // }

    }


});
