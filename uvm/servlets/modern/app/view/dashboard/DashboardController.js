/**
 * Dashboard Controller which displays and manages the Dashboard Widgets
 * Widgets can be affected by following actions:
 * - remove/add/modify widget entry itself;
 * - install/uninstall Reports or start/stop Reports service
 * - install/uninstall Apps which can lead in a report widget to be available or not;
 * - modifying a report that is used by a widget, which requires reload of that affected widget
 */
Ext.define('Ung.view.dashboard.DashboardController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.dashboard',
    viewModel: true,
    control: {
        // '#': {
        //     activate: 'onActivate',
        //     deactivate: 'onDeactivate',
        // },
        // '#dashboard': {
        //     resize: 'onResize'
        // }
    },

    widgetsRendered: false,

    listen: {
        global: {
            // init: 'loadWidgets',
            // appinstall: 'onAppInstall',
            // addRemoveReportwidget: 'onAddRemoveReportWidget', // fired from Reports view
            // reportsInstall: 'loadWidgets',
            // widgetaction: 'onWidgetAction'
        }
    },

    // not used
    // onAfterRender: function (view) {
    //     // var me = this;
    //     // me.getViewModel().bind('{theme}', function (theme) {
    //     //     Ung.dashboardSettings.theme = theme;
    //     //     Ext.Array.each(me.lookup('dashboard').query('graphreport'), function (graph) {
    //     //         graph.getController().setStyles();
    //     //     });
    //     // });

    // },

});
