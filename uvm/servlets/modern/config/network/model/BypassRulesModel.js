Ext.define('Ung.model.BypassRules', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'description' },
        { name: 'conditions', type: 'auto' },
        { name: 'bypass', type: 'boolean' },
    ],
    validators: {
        description: 'presence',
        conditions: function (value) {
            if (value.list.length === 0) {
                return 'You must add some conditions!';
            }
            return true;
        }
    }
});
