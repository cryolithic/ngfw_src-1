Ext.define('NatRules', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'description' },
        { name: 'newSource' }
    ],
    validators: {
        description: 'presence',
        newSource: function () {
            return 'some error text';
        }
    }
});
