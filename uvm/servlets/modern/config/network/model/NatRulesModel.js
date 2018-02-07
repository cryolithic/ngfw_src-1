Ext.define('Ung.model.NatRules', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'description' },
        { name: 'newSource', type: 'string' },
        { name: 'auto', type: 'boolean' },
        { name: 'conditions', type: 'auto' }
    ],
    validators: {
        description: 'presence',
        newSource: function (value, record) {
            // console.log(record.get('auto'));
            if (!record.get('auto') && !value) {
                return 'Specify new source!';
            }
            return true;
        },
        conditions: function (value) {
            if (value.list.length === 0) {
                return 'You must add some conditions!';
            }
            return true;
        }
    }
});
