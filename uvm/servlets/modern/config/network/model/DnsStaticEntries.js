Ext.define('Ung.model.DnsStaticEntries', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'name', type: 'string' },
        { name: 'address', type: 'string' }
    ],
    validators: {
        name: 'presence',
        address: 'ipaddress'
    }
});
