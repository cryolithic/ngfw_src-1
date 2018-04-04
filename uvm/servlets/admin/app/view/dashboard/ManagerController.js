Ext.define('Ung.view.dashboard.ManagerController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.dashboardmanager',
    // viewModel: true,

    control: {
        '#': {
            afterrender: 'onAfterRender',
        }
    },

    listen: {
        global: {
            addwidget: 'onAddWidget',
            updatewidget: 'onUpdateWidget'
        }
    },

    onAfterRender: function (view) {
        var me = this;
        // the dasboard widgets holder
        me.dashboard = view.up('#dashboardMain').lookup('dashboard');

        /**
         * (re)load widgets when Reports App installed/removed or enabled/disabled
         */
        me.getViewModel().bind('{reportsAppStatus}', function () {
            console.log('load');
            me.loadWidgets();
        });
    },

    /**
     * Render widgets into the dashboard
     */
    loadWidgets: function() {
        var me = this, vm = me.getViewModel(),
            widgetsCmps = [], entry;

        // refresh the dashboard manager grid if the widgets were affected
        // me.lookup('dashboardManager').getView().refresh();
        me.dashboard.removeAll(true);

        Ext.getStore('widgets').each(function (record) {
            if (!record.get('enabled')) {
                widgetsCmps.push({
                    xtype: 'component',
                    itemId: record.get('itemId'),
                    hidden: true
                });
                return;
            }

            if (record.get('type') !== 'ReportEntry') {
                widgetsCmps.push({
                    xtype: record.get('type').toLowerCase() + 'widget',
                    itemId: record.get('itemId'),
                    lastFetchTime: null,
                    visible: true,
                    viewModel: {
                        data: {
                            widget: record
                        }
                    }
                });
                return;
            }

            if (vm.get('reportsAppStatus.installed') && vm.get('reportsAppStatus.enabled')) {
                entry = Ext.getStore('reports').findRecord('uniqueId', record.get('entryId'));

                if (entry && !Ext.getStore('unavailableApps').first().get(entry.get('category'))) {
                    widgetsCmps.push({
                        xtype: 'reportwidget',
                        itemId: record.get('itemId'),
                        lastFetchTime: null,
                        visible: true,
                        viewModel: {
                            data: {
                                widget: record,
                                entry: entry
                            }
                        }
                    });
                }
            }

        });
        me.getView().getView().refresh(); // refres the grid view
        me.dashboard.add(widgetsCmps);

        // if (!me.widgetsRendered) {
        //     me.widgetsRendered = true;
        //     // add scroll/resize events
        //     dashboard.body.on('scroll', me.debounce(me.updateWidgetsVisibility, 500));
        //     dashboard.getEl().on('resize', me.debounce(me.updateWidgetsVisibility, 500));
        // }
    },

    // listens on widgets store add event and adds widget component to dashboard
    onAddWidget: function (records) {
        var me = this;
        Ext.Array.each(records, function (record) {
            if (record.get('type') !== 'ReportEntry') {
                me.dashboard.add({
                    xtype: record.get('type').toLowerCase() + 'widget',
                    itemId: record.get('itemId'),
                    lastFetchTime: null,
                    visible: true,
                    viewModel: {
                        data: {
                            widget: record
                        }
                    }
                });
            } else {
                console.log();
            }
        });
    },


    onUpdateWidget: function (store, record, operation) {
        var me = this, vm = me.getViewModel(), entry,
            enabled = record.get('enabled'),
            widgetCmp = me.dashboard.down('#' + record.get('itemId')),
            index = store.indexOf(record);

        if (widgetCmp) { widgetCmp.destroy(); }

        if (enabled) {
            if (record.get('type') !== 'ReportEntry') {
                widgetCmp = me.dashboard.insert(index, {
                    xtype: record.get('type').toLowerCase() + 'widget',
                    itemId: record.get('itemId'),
                    visible: true,
                    lastFetchTime: null,
                    viewModel: {
                        data: {
                            widget: record
                        }
                    }
                });
            } else {
                if (!vm.get('reportsAppStatus.installed')) {
                    Ext.Msg.alert('Info'.t(), 'To enable App Widgets please install Reports first!'.t());
                    return;
                }
                if (!vm.get('reportsAppStatus.enabled')) {
                    Ext.Msg.alert('Info'.t(), 'To view App Widgets enable the Reports App first!'.t());
                    return;
                }

                entry = Ext.getStore('reports').findRecord('uniqueId', record.get('entryId'));

                if (entry) {
                    if (!Ext.getStore('unavailableApps').first().get(entry.get('category'))) {
                        widgetCmp = me.dashboard.insert(index, {
                            xtype: 'reportwidget',
                            itemId: record.get('itemId'),
                            visible: true,
                            lastFetchTime: null,
                            viewModel: {
                                data: {
                                    widget: record,
                                    entry: entry
                                }
                            }
                        });
                        // setTimeout(function () {
                        //     me.dashboard.scrollTo(0, me.dashboard.getEl().getScrollTop() + widgetCmp.getEl().getY() - 121, {duration: 300 });
                        // }, 100);
                    } else {
                        Ext.Msg.alert('Install required'.t(), Ext.String.format('To enable this Widget please install <strong>{0}</strong> app first!'.t(), entry.get('category')));
                    }
                } else {
                    Util.handleException('This entry is not available and it should be removed!');
                }

            }
            if (widgetCmp) {
                setTimeout(function () {
                    me.dashboard.scrollTo(0, me.dashboard.getEl().getScrollTop() + widgetCmp.getEl().getY() - 121, {duration: 300 });
                }, 100);
            }
        } else {
            me.dashboard.insert(index, {
                xtype: 'component',
                itemId: record.get('itemId'),
                hidden: true
            });
        }
    },

    newReportWidget: function () {
        this.showWidgetEditor(null, null);
    },

    showWidgetEditor: function (widget, entry) {
        var me = this;
        me.addWin = me.getView().add({
            xtype: 'new-widget',
            viewModel: {
                data: {
                    widget: widget,
                    entry: entry
                }
            }
        });
        me.addWin.show();
    },

    /**
     * Method which sends modified dashboard settings to backend to be saved
     */
    applyChanges: function () {
        var me = this;

        // drop record selected for removal
        Ext.getStore('widgets').each(function (record) {
            if (record.get('markedForDelete')) {
                record.drop();
            }
        });

        // because of the drag/drop reorder the settins widgets are updated to respect new ordering
        Ung.dashboardSettings.widgets.list = Ext.Array.pluck(Ext.getStore('widgets').getRange(), 'data');

        Rpc.asyncData('rpc.dashboardManager.setSettings', Ung.dashboardSettings)
            .then(function() {
                Util.successToast('<span style="color: yellow; font-weight: 600;">Dashboard Saved!</span>');
                Ext.getStore('widgets').sync();
                // me.toggleManager();

                // remove widgets from dashboard if removed from store (manager)
                Ext.Array.each(me.dashboard.query('[widgetCmp]'), function (widgetCmp) {
                    if (Ext.getStore('widgets').find('itemId', widgetCmp.getItemId()) < 0) {
                        me.dashboard.remove(widgetCmp);
                    }
                });

            });

    },

    showOrderingColumn: function () {
        var me = this, columns = me.getView().getColumns();
        columns[0].setHidden(false);
    },

    /**
     * todo: after drag sort event
     */
    onDrop: function (app, data, overModel, dropPosition) {
        var me = this,
            widgetMoved = me.dashboard.down('#' + data.records[0].get('itemId')),
            widgetDropped = me.dashboard.down('#' + overModel.get('itemId'));

        /*
        widgetMoved.addCls('moved');

        window.setTimeout(function () {
            widgetMoved.removeCls('moved');
        }, 300);
        */

        if (dropPosition === 'before') {
            me.dashboard.moveBefore(widgetMoved, widgetDropped);
        } else {
            me.dashboard.moveAfter(widgetMoved, widgetDropped);
        }
    },

    onItemClick: function (cell, td, cellIndex, record) {
        var me = this, widgetCmp;

        if (cellIndex === 1) {
            // toggle visibility or show alerts
            record.set('enabled', !record.get('enabled'));
        }

        if (cellIndex === 2) {
            // highlights in the dashboard the widget which receives click event in the manager grid
            widgetCmp = me.dashboard.down('#' + record.get('entryId')) || me.dashboard.down('#' + record.get('type'));
            if (widgetCmp && !widgetCmp.isHidden()) {
                me.dashboard.addBodyCls('highlight');
                widgetCmp.addCls('highlight-item');
                me.dashboard.scrollTo(0, me.dashboard.body.getScrollTop() + widgetCmp.getEl().getY() - 107, {duration: 100});
            }
        }
    },

    /**
     * removes the above set highlight
     */
    onItemLeave: function (view, record) {
        var me = this, widgetCmp;
        if (this.tout) {
            window.clearTimeout(this.tout);
        }
        if (record.get('type') !== 'ReportEntry') {
            widgetCmp = me.dashboard.down('#' + record.get('type'));
        } else {
            widgetCmp = me.dashboard.down('#' + record.get('entryId'));
        }
        if (widgetCmp) {
            me.dashboard.removeBodyCls('highlight');
            widgetCmp.removeCls('highlight-item');
        }
    },

    resetDashboard: function () {
        var me = this, vm = me.getViewModel();
        Ext.MessageBox.confirm('Warning'.t(),
            'This will overwrite the current dashboard settings with the defaults.'.t() + '<br/><br/>' +
            'Do you want to continue?'.t(),
            function (btn) {
                if (btn === 'yes') {
                    Rpc.asyncData('rpc.dashboardManager.resetSettingsToDefault').then(function () {
                        Rpc.asyncData('rpc.dashboardManager.getSettings')
                            .then(function (result) {
                                Ung.dashboardSettings = result;
                                Ext.getStore('widgets').loadData(result.widgets.list);
                                me.loadWidgets();
                                Util.successToast('Dashboard reset done!');
                                vm.set('managerVisible', false);
                            });
                    });
                }
            });
    },

    // renderers
    enableRenderer: function (value, meta, record) {
        var vm = this.getViewModel();
        meta.tdCls = 'enable';
        if (record.get('type') !== 'ReportEntry') {
            return '<i class="fa ' + (value ? 'fa-check-circle-o' : 'fa-circle-o') + ' fa-lg"></i>';
        }
        var entry = Ext.getStore('reports').findRecord('uniqueId', record.get('entryId'));

        if (!entry || Ext.getStore('unavailableApps').first().get(entry.get('category')) || !vm.get('reportsAppStatus.enabled')) {
            return '<i class="fa fa-info-circle fa-lg"></i>';
        }
        return '<i class="fa ' + (value ? 'fa-check-circle-o' : 'fa-circle-o') + ' fa-lg"></i>';
    },

    /**
     * renders the title of the widget in the dashboard manager grid, based on various conditions
     */
    widgetTitleRenderer: function (value, metaData, record) {
        var me = this, vm = me.getViewModel(), entry, title, unavailApp, enabled;
        enabled = record.get('enabled');

        if (!value) {
            return '<span style="' + (!enabled ? 'font-weight: 400; color: #777;' : 'font-weight: 600; color: #000;') + '">' + record.get('type') + '</span>'; // <br/><span style="font-size: 10px; color: #777;">Common</span>';
        }
        if (vm.get('reportsAppStatus.installed')) {
            entry = Ext.getStore('reports').findRecord('uniqueId', value);
            if (entry) {
                unavailApp = Ext.getStore('unavailableApps').first().get(entry.get('category'));
                title = '<span style="' + ((unavailApp || !enabled) ? 'font-weight: 400; color: #777;' : 'font-weight: 600; color: #000;') + '">' + (entry.get('readOnly') ? entry.get('title').t() : entry.get('title')) + '</span>';
                return title;
            } else {
                return 'Unknown Widget'.t();
            }
        } else {
            return '<span style="color: #999;">' + 'App Widget'.t() + '</span>';
        }
    },
});
