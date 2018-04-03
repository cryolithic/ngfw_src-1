Ext.define('Ung.view.reports.EntrySettingsController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.entrysettings',

    control: {
        '#': {
            afterrender: 'onAfterRender',
            // deactivate: 'onDeactivate'
        }
    },

    onAfterRender: function (view) {
        var me = this, vm = me.getViewModel(), ctrl;

        vm.bind('{eEntry}', function (eEntry) {
            console.log('bind eEntry');
            var activeDataColumnsCard;

            // vm.set('validForm', true); // te remove the valid warning

            // me.setReportCard(entry.get('type'));

            switch(eEntry.get('type')) {
            case 'TEXT':
                ctrl = me.getView().down('textreport').getController();
                activeDataColumnsCard = 'textDataColumnsGrid';
                break;
            case 'EVENT_LIST':
                ctrl = me.getView().down('eventreport').getController();
                break;
            default:
                ctrl = me.getView().down('graphreport').getController();
                activeDataColumnsCard = 'timeDataColumnsGrid';
            }
            // if (reps) { reps.getViewModel().set('fetching', true); }
            ctrl.fetchData(false, function (data) {
                console.log('fetch');
            });

            vm.set('textColumns', Ext.Array.map(eEntry.get('textColumns') || [], function (col) { return { str: col }; }));
            vm.set('timeDataColumns', Ext.Array.map(eEntry.get('timeDataColumns') || [], function (col) { return { str: col }; }));

            vm.set('activeDataColumnsCard', activeDataColumnsCard);
        });

        // // when editing entry update graph styles on the fly
        // vm.bind('{eEntry.pieStyle}', function (pieStyle) {
        //     console.log('bind eEntry pie');
        //     if (!pieStyle) { return; }
        //     ctrl.setStyles();
        // });

        // vm.bind('{eEntry.timeStyle}', function (timeStyle) {
        //     console.log('bind eEntry time');
        //     if (!timeStyle) { return; }
        //     ctrl.setStyles();
        // });

    },

    cancel: function (btn) {
        btn.up('window').hide();
    },


    onTextColumnsChanged: function (store) {
        var vm = this.getViewModel(), tdc = [];
        // update validation counter
        vm.set('textColumnsCount', store.getCount());
        // update the actual entry
        store.each(function (col) { tdc.push(col.get('str')); });
        vm.set('eEntry.textColumns', tdc);
    },

    onTimeDataColumnsChanged: function (store) {
        var vm = this.getViewModel(), tdc = [];
        // update validation counter
        vm.set('timeDataColumnsCount', store.getCount());
        // update the actual entry
        store.each(function (col) { tdc.push(col.get('str')); });
        vm.set('eEntry.timeDataColumns', tdc);
    },

    removeTextColumn: function (view, rowIndex, colIndex, item, e, record) {
        var store = view.getStore();
        store.remove(record);
        view.refresh();
    },

    removeTimeDataColumn: function (view, rowIndex, colIndex, item, e, record) {
        var store = view.getStore();
        store.remove(record);
        view.refresh();
    }

});
