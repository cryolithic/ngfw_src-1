Ext.define('Ung.model.Event', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'time_stamp', type: 'auto' },
        {
            name: 'date',
            calculate: function (model) {
                var ts = model.time_stamp, value;
                if (!ts) { return ''; }
                if ((typeof(ts) === 'object') && ts.time) { value = ts.time; }
                return new Date(value - value % (3600 * 1000));
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
    ]
});
