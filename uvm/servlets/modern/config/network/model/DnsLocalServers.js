Ext.define('Ung.model.DnsLocalServers', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'domain', type: 'string' },
        { name: 'localServer', type: 'string' }
    ],
    validators: {
        domain: ['presence', 'domain'],
        localServer: ['presence', 'ipaddress']
    }
});
