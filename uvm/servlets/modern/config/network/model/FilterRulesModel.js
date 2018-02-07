Ext.define('Ung.model.FilterRules', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'enabled', type: 'boolean' },
        { name: 'ipv6Enabled', type: 'boolean' },
        { name: 'description' },
        { name: 'conditions', type: 'auto' },
        // actions
        { name: 'blocked', type: 'boolean' },
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
