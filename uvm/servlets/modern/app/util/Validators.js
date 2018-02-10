Ext.define('Ext.data.validator.ipAddress', {
    extend: 'Ext.data.validator.Format',
    alias: 'data.validator.ipaddress',
    type: 'ipaddress',
    message: 'Is not a valid IP address'.t(),
    matcher: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
});

Ext.define('Ext.data.validator.domain', {
    extend: 'Ext.data.validator.Format',
    alias: 'data.validator.domain',
    type: 'domain',
    message: 'Is not a valid domain'.t(),
    matcher: /[a-zA-Z0-9\-_.]/
});