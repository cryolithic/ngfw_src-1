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
        '#': {
            afterrender: 'onAfterRender',
            activate: 'onActivate',
            deactivate: 'onDeactivate',
        },
        '#dashboard': {
            resize: 'onResize'
        }
    },

    widgetsRendered: false,

    listen: {
        global: {
            widgetaction: 'onWidgetAction',
            // addwidget: 'onAddWidget'
        },
        store: {
            '#stats': {
                datachanged: 'onStatsUpdate'
            }
        }
    },

    onAfterRender: function () {
        var me = this, vm = me.getViewModel(), text;

        /**
         * Fetch dashboard settings
         */
        Rpc.asyncData('rpc.dashboardManager.getSettings')
            .then(function (result) {
                // initially the timeframe could be null
                if (!result.timeframe) {
                    result.timeframe = 1;
                }
                Ung.dashboardSettings = result;
                Ext.getStore('widgets').loadData(result.widgets.list);

                if (result.timeframe === 1) {
                    text = '1 Hour ago'.t();
                } else {
                    text = result.timeframe + ' Hours ago'.t();
                }

                me.getView().down('#since > button').setText(text);

                Ung.app.reportscheck();
            });

        /**
         * On global conditions change refetch data based on new conditions
         * Using {query.string} because it fires only when the value changes, unlike {query} only
         */
        vm.bind('{query.string}', function () {
            Ext.Array.each(me.lookup('dashboard').query('reportwidget'), function (widgetCmp) {
                if (widgetCmp.lastFetchTime) {
                    widgetCmp.lastFetchTime = null;
                    DashboardQueue.add(widgetCmp);
                }
            });
        });

    },

    /**
     * Helper method used to slowfire resize or scroll events
     */
    debounce: function (fn, delay) {
        var timer = null;
        var me = this;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(me, arguments);
            }, delay);
        };
    },

    /**
     * Checks if widget is visible or not in viewport
     * Based on it's visibility it will be added to queue for fetching data
     */
    updateWidgetsVisibility: function () {
        var dashboard = this.lookup('dashboard'),
            widgets = dashboard.query('reportwidget');
        DashboardQueue.isVisible(dashboard.down('networklayoutwidget'));
        DashboardQueue.isVisible(dashboard.down('mapdistributionwidget'));
        DashboardQueue.isVisible(dashboard.down('networkinformationwidget'));
        DashboardQueue.isVisible(dashboard.down('policyoverviewwidget'));
        DashboardQueue.isVisible(dashboard.down('notificationswidget'));
        Ext.Array.each(widgets, function (widget) {
            if (widget) {
                DashboardQueue.isVisible(widget);
            }
        });
    },

    updateSince: function (menu, item) {
        var me = this, dashboard = me.lookup('dashboard');
        menu.up('button').setText(item.text);
        Ung.dashboardSettings.timeframe = item.value;

        Rpc.asyncData('rpc.dashboardManager.setSettings', Ung.dashboardSettings)
            .then(function() {
                Ext.Array.each(dashboard.query('reportwidget'), function (widgetCmp) {
                    widgetCmp.lastFetchTime = null;
                });
                me.updateWidgetsVisibility();
            });

    },


    onResize: function (view) {
        if (view.down('window')) {
            view.down('window').close();
        }
    },

    toggleManager: function () {
        var me = this, vm = me.getViewModel(),
            columns = me.lookup('dashboardManager').getColumns();

        vm.set('managerVisible', !vm.get('managerVisible'));
        if (!vm.get('managerVisible')) {
            columns[0].setHidden(true);
        }
    },

    /**
     * when a app is installed or removed apply changes to dashboard
     */
    onAppInstall: function (action, app) {
        // refresh dashboard manager grid
        this.getView().lookupReference('dashboardManager').getView().refresh();

        var dashboard = this.getView().lookupReference('dashboard'), wg,
            widgets = Ext.getStore('widgets').getRange(), widget, entry, i;

        // traverse all widgets and add/remove those with report category as the passed app
        for (i = 0; i < widgets.length; i += 1 ) {
            widget = widgets[i];
            entry = Ext.getStore('reports').findRecord('uniqueId', widget.get('entryId'));
            if (entry && entry.get('category') === app.displayName) {
                // remove widget placeholder
                dashboard.remove(widget.get('entryId'));
                if (action === 'install') {
                    // add real widget
                    wg = dashboard.insert(i, {
                        xtype: 'reportwidget',
                        itemId: widget.get('entryId'),
                        lastFetchTime: null,
                        visible: true,
                        // bind: {
                        //     userCls: 'theme-{theme}'
                        // },
                        // refreshIntervalSec: widget.get('refreshIntervalSec'),
                        viewModel: {
                            data: {
                                widget: widget,
                                entry: entry,
                            }
                        }
                    });
                    Ext.defer(function () {
                        DashboardQueue.addFirst(wg);
                    }, 1000);
                } else {
                    // add widget placeholder
                    dashboard.insert(i, {
                        xtype: 'component',
                        itemId: widget.get('entryId'),
                        hidden: true
                    });
                }
            }
        }
    },

    /**
     * widget actions on add/remove/save
     */
    onWidgetAction: function (action, widget, entry, cb) {
        var me = this, wg, wgCmp;
        // var widgetsList = Ext.Array.pluck(Ext.getStore('widgets').getRange(), 'data');
        if (action === 'add') {
            Ung.dashboardSettings.widgets.list.push(widget.getData());
        }
        if (action === 'remove') {
            wg = Ext.Array.findBy(Ung.dashboardSettings.widgets.list, function (wg) {
                return wg.entryId === widget.get('entryId');
            });
            if (wg) {
                Ext.Array.remove(Ung.dashboardSettings.widgets.list, wg);
            }
        }
        if (action === 'save') {
            wg = Ext.Array.findBy(Ung.dashboardSettings.widgets.list, function (wg) {
                return wg.entryId === widget.get('entryId');
            });
            if (wg) {
                Ext.apply(wg, widget.getData());
            }
        }

        // try to save it
        Rpc.asyncData('rpc.dashboardManager.setSettings', Ung.dashboardSettings).then(function () {
            var wg2 = Ext.getStore('widgets').findRecord('entryId', widget.get('entryId')) || widget;
            if (action === 'remove') {
                me.lookup('dashboard').remove(wg2.get('entryId'));
                wg2.drop();
                cb(null);
                return;
            }

            if (action === 'add') {
                Ext.getStore('widgets').add(wg2);
                wg2.commit();
                if (wg2.get('enabled')) {
                    wgCmp = me.lookup('dashboard').add({
                        xtype: 'reportwidget',
                        itemId: wg2.get('entryId'),
                        visible: true,
                        lastFetchTime: null,
                        // bind: {
                        //     userCls: 'theme-{theme}'
                        // },
                        viewModel: {
                            data: {
                                widget: wg2,
                                entry: entry
                            }
                        }
                    });
                    Ext.defer(function () {
                        DashboardQueue.addFirst(wgCmp);
                    }, 1000);
                } else {
                    me.lookup('dashboard').add({
                        xtype: 'component',
                        itemId: wg2.get('entryId'),
                        hidden: true
                    });
                }
            }

            if (action === 'save') {
                wg2.copyFrom(widget);
                wg2.commit();

                wgCmp = me.lookup('dashboard').down('#' + wg2.get('entryId'));
                var idx = Ext.getStore('widgets').indexOf(wg2);

                if (wgCmp.getXType() === 'component') {
                    if (wg2.get('enabled')) {
                        wgCmp.destroy();
                        me.lookup('dashboard').insert(idx, {
                            xtype: 'reportwidget',
                            itemId: wg2.get('entryId'),
                            visible: true,
                            lastFetchTime: null,
                            // bind: {
                            //     userCls: 'theme-{theme}'
                            // },
                            viewModel: {
                                data: {
                                    widget: wg2,
                                    entry: entry
                                }
                            }
                        });
                    }
                } else {
                    if (wg2.get('enabled')) {
                        DashboardQueue.addFirst(wgCmp);
                    } else {
                        wgCmp.destroy();
                        me.lookup('dashboard').insert(idx, {
                            xtype: 'component',
                            itemId: wg2.get('entryId'),
                            hidden: true
                        });
                    }
                }
            }
            cb(wg2);
        });
    },


    onRemoveWidget: function (id) {
        var dashboard = this.getView().lookupReference('dashboard');
        if (dashboard.down('#' + id)) {
            dashboard.remove(id);
        }
    },

    onAddRemoveReportWidget: function (entry, isWidget, cb) {
        var me = this, widget, dashboardCmp = me.lookupReference('dashboard');

        if (isWidget) {
            // remove it from settings
            widget = Ext.getStore('widgets').findRecord('entryId', entry.get('uniqueId'));
            if (widget) {
                Ext.getStore('widgets').remove(widget);
                Ung.dashboardSettings.widgets.list = Ext.Array.pluck(Ext.getStore('widgets').getRange(), 'data');
            }
        } else {
            // add it to settings
            widget = {
                displayColumns: entry.get('displayColumns'),
                enabled: true,
                entryId: entry.get('uniqueId'),
                javaClass: 'com.untangle.uvm.DashboardWidgetSettings',
                refreshIntervalSec: 60,
                type: 'ReportEntry'
            };
            Ung.dashboardSettings.widgets.list.push(widget);
        }

        Rpc.asyncData('rpc.dashboardManager.setSettings', Ung.dashboardSettings).then(function () {
            if (!isWidget) {
                // add it in dashboard
                Ext.getStore('widgets').add(widget);
                // display widget in dashboard
                dashboardCmp.add({
                    xtype: 'reportwidget',
                    itemId: widget.entryId,
                    visible: true,
                    lastFetchTime: null,
                    // bind: {
                    //     userCls: 'theme-{theme}'
                    // },
                    refreshIntervalSec: widget.refreshIntervalSec,
                    viewModel: {
                        data: {
                            widget: widget,
                            entry: entry
                        }
                    }
                });
                Ung.app.redirectTo('#');
            } else {
                // removed from dashboard
                dashboardCmp.remove(widget.get('entryId'));
            }
            cb();
        });
    },

    onStatsUpdate: function() {
        var vm = this.getViewModel();
        vm.set('stats', Ext.getStore('stats').first());

        // get devices
        // @todo: review this based on oler implementation
        rpc.deviceTable.getDevices(function (result, ex) {
            if (ex) { Util.handleException(ex); return false; }
            vm.set('deviceCount', result.list.length);
        });
    },

    onActivate: function () {
        DashboardQueue.paused = false;
        this.updateWidgetsVisibility();
        // var me = this;
        // if (me.activated) {
        //     return;
        // }
        // me.activated = true;
    },

    onDeactivate: function () {
        DashboardQueue.paused = true;
        var vm = this.getViewModel();
        if (vm.get('managerVisible')) {
            this.toggleManager();
        }
    },

    exportWidgets: function () {
        var widgetsArr = [], w;
        Ext.getStore('widgets').each(function (widget) {
            w = widget.getData();
            delete w._id;
            widgetsArr.push(w);
        });

        Ext.MessageBox.wait('Exporting Widgets...'.t(), 'Please wait'.t());
        var exportForm = document.getElementById('exportGridSettings');
        exportForm.gridName.value = 'Widgets'.t(); // used in exported file name
        exportForm.gridData.value = Ext.encode(widgetsArr);
        exportForm.submit();
        Ext.MessageBox.hide();
    }

});
