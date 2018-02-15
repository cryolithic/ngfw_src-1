Ext.define('Ung.store.Events', {
    extend: 'Ext.data.Store',
    storeId: 'events',
    alias: 'store.events',

    fields: [
        { name: 'time_stamp', type: 'auto' },
        {
            name: 'date',
            calculate: function (model) {
                var ts = model.time_stamp, value;
                if (!ts) { return ''; }
                if ((typeof(ts) === 'object') && ts.time) { value = ts.time; }
                return new Date(value - value % (3600 * 24 * 1000));
            }
        },
        {
            name: 'time',
            calculate: function (model) {
                var ts = model.time_stamp, value;
                if (!ts) { return ''; }
                if ((typeof(ts) === 'object') && ts.time) { value = ts.time; }
                return new Date(value);
            }
        },                
    ],    

    // groupField: 'date',
    // groupDir: 'DESC',
    sorters: [{
        property: 'time',
        direction: 'DESC'
    }],

    data: [],

    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }
});
