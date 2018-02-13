Ext.define('Ung.view.reports.ReportsController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.reports',

    onInitialize: function () {
        // Ext.getStore('reportstree').build();
    },

    // onActivate: function () {
    //     console.log('activate');
    // },

    onSelectionChange: function (el, record) {
        var me = this, view = me.getView();
        if (!record || !record.get('url')) { return; }
        Ung.app.redirectTo('#reports/' + record.get('url'));

        me.lookup('eventreport').setHtml('event report deselected');
        me.lookup('graphreport').setHtml('graph report deselected');
        me.lookup('textreport').setHtml('text report deselected');

        switch(record.get('type')) {
        case 'EVENT_LIST': me.lookup('eventreport').setHtml('event report selected'); break;
        case 'TIME_GRAPH':
        case 'PIE_GRAPH':
        case 'TIME_GRAPH_DYNAMIC': me.lookup('graphreport').setHtml('graph report selected'); break;
        case 'TEXT': me.lookup('textreport').setHtml('text report selected'); break;
        }

    }


});
