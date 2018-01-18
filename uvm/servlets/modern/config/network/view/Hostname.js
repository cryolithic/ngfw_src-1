Ext.define('Ung.config.network.view.Hostname', {
    extend: 'Ext.Panel',
    alias: 'widget.config-network-hostname',
    itemId: 'hostname',
    scrollable: true,

    withValidation: true, // requires validation on save
    viewModel: true,

    title: 'Hostname'.t(),

    bodyPadding: '10 20',

    layout: 'vbox',

    items: [{
        xtype: 'formpanel',
        layout: {
            type: 'form',
            labelWidth: 120
        },
        width: 600,
        defaults: {
            labelTextAlign: 'right'
        },
        items: [{
            xtype: 'textfield',
            width: 200,
            label: 'Hostname'.t(),
            placeholder: 'eg: gateway'.t()
        }, {
            xtype: 'textfield',
            label: 'Domain Name'.t(),
            placeholder: 'eg: example.com'.t()
        }]
    }, {
        xtype: 'formpanel',
        layout: {
            type: 'form',
            labelWidth: 100
        },
        width: 600,
        items: [{
            xtype: 'checkbox',
            label: '',
            boxLabel: 'Dynamic DNS Service Configuration'.t(),
            bind: '{settings.dynamicDnsServiceEnabled}'
        }]
    }, {
        xtype: 'formpanel',
        layout: {
            type: 'form',
            labelWidth: 120
        },
        width: 600,
        defaults: {
            labelTextAlign: 'right'
        },
        items: [{
            xtype: 'combobox',
            label: 'Service'.t(),
            hidden: true,
            bind: {
                value: '{settings.dynamicDnsServiceName}',
                hidden: '{!settings.dynamicDnsServiceEnabled}'
            },
            queryMode: 'local',
            editable: false,
            valueField: 'name',
            displayField: 'displayName',
            store: [
                { name: 'easydns', displayName: 'EasyDNS' },
                { name: 'zoneedit', displayName: 'ZoneEdit' },
                { name: 'dyndns', displayName: 'DynDNS' },
                { name: 'namecheap', displayName: 'Namecheap' },
                { name: 'dslreports', displayName: 'DSL-Reports' },
                { name: 'dnspark', displayName: 'DNSPark' },
                { name: 'no-ip', displayName: 'No-IP' },
                { name: 'dnsomatic', displayName: 'DNS-O-Matic'},
                { name: 'freedns', displayName: 'FreeDNS' },
                { name: 'google', displayName: 'Google' },
                // { name: 'cloudflare', displayName: 'Cloudflare' }
            ]
        }, {
            xtype: 'textfield',
            label: 'Username'.t(),
            hidden: true,
            bind: {
                value: '{settings.dynamicDnsServiceUsername}',
                hidden: '{!settings.dynamicDnsServiceEnabled}'
            }
        }, {
            xtype: 'textfield',
            label: 'Password'.t(),
            hidden: true,
            bind: {
                value: '{settings.dynamicDnsServicePassword}',
                hidden: '{!settings.dynamicDnsServiceEnabled}'
            },
            inputType: 'password'
        }, {
            xtype: 'textfield',
            label: 'Hostname(s)'.t(),
            hidden: true,
            bind: {
                value: '{settings.dynamicDnsServiceHostnames}',
                hidden: '{!settings.dynamicDnsServiceEnabled}'
            },
        }]
    }, {
        xtype: 'formpanel',
        layout: 'form',
        // width: 800,
        items: [{
            xtype: 'displayfield',
            // bind: {
            //     html: '{settings.publicUrlMethod}'
            // }
            html: Ext.String.format('The Public Address is the address/URL that provides a public location for the {0} Server. This address will be used in emails sent by the {0} Server to link back to services hosted on the {0} Server such as Quarantine Digests and OpenVPN Client emails.'.t(), rpc.companyName)
        }, {
            xtype: 'displayfield',
            html: Ext.String.format('This works if your {0} Server has a routable public static IP address.'.t(), rpc.companyName)
        }, {
            xtype: 'radiofield',
            name: 'aaa',
            boxLabel: '<strong>' + 'Use IP address from External interface (default)'.t() + '</strong>',
            bind: {
                value: '{settings.publicUrlMethod}'
            }
        }, {
            xtype: 'displayfield',
            html: Ext.String.format('This is recommended if the {0} Server\'s fully qualified domain name looks up to its IP address both internally and externally.'.t(), rpc.companyName)
        }, {
            xtype: 'radiofield',
            name: 'aaa',
            boxLabel: '<strong>' + 'Use Hostname'.t() + '</strong>',
            inputValue: 'hostname',
            bind: {
                value: '{settings.publicUrlMethod}'
            }
        }, {
            xtype: 'displayfield',
            html: Ext.String.format('This is recommended if the {0} Server is installed behind another firewall with a port forward from the specified hostname/IP that redirects traffic to the {0} Server.'.t(), rpc.companyName)
        }, {
            xtype: 'radiofield',
            name: 'aaa',
            boxLabel: '<strong>' + 'Use Manually Specified Address'.t() + '</strong>',
            inputValue: 'address_and_port',
            bind: {
                value: '{settings.publicUrlMethod}'
            }
        }]
    }],



    // items: [{
    //     xtype: 'container',
    //     layout: 'hbox',
    //     defaults: {
    //         margin: 5
    //     },
    //     items: [{
    //         xtype: 'textfield',
    //         label: 'Hostname'.t(),
    //         placeholder: 'e.g. gateway'.t(),
    //         bind: '{settings.hostName}'
    //     }, {
    //         xtype: 'textfield',
    //         label: 'Domain Name'.t(),
    //         placeholder: 'e.g. example.com'.t()
    //     }]
    // }, {
    //     xtype: 'checkbox',
    //     boxLabel: 'Dynamic DNS Service Configuration'.t()
    // }, {
    //     xtype: 'fieldset',
    //     margin: '20 0',
    //     title: 'Dynamic DNS Service Configuration'.t(),
    //     items: [{
    //         xtype: 'checkbox',
    //         boxLabel: 'Enabled'.t()
    //     }, {
    //         xtype: 'combobox',
    //         label: 'Service'.t(),
    //         bind: '{settings.dynamicDnsServiceName}',
    //         queryMode: 'local',
    //         valueField: 'name',
    //         displayField: 'displayName',
    //         store: [
    //             { name: 'easydns', displayName: 'EasyDNS' },
    //             { name: 'zoneedit', displayName: 'ZoneEdit' },
    //             { name: 'dyndns', displayName: 'DynDNS' },
    //             { name: 'namecheap', displayName: 'Namecheap' },
    //             { name: 'dslreports', displayName: 'DSL-Reports' },
    //             { name: 'dnspark', displayName: 'DNSPark' },
    //             { name: 'no-ip', displayName: 'No-IP' },
    //             { name: 'dnsomatic', displayName: 'DNS-O-Matic'},
    //             { name: 'freedns', displayName: 'FreeDNS' },
    //             { name: 'google', displayName: 'Google' },
    //             // { name: 'cloudflare', displayName: 'Cloudflare' }
    //         ]
    //     }]
        // checkboxToggle: true,
        // collapsible: true,
        // collapsed: true,
        // padding: 10,
        // checkbox: {
        //     bind: {
        //         value: '{settings.dynamicDnsServiceEnabled}'
        //     }
        // },
        // defaults: {
        //     labelAlign: 'right'
        // },
        // items: [{
        //     xtype: 'combo',
        //     fieldLabel: 'Service'.t(),
        //     bind: '{settings.dynamicDnsServiceName}',
        //     store: [['easydns','EasyDNS'],
        //             ['zoneedit','ZoneEdit'],
        //             ['dyndns','DynDNS'],
        //             ['namecheap','Namecheap'],
        //             ['dslreports','DSL-Reports'],
        //             ['dnspark','DNSPark'],
        //             ['no-ip','No-IP'],
        //             ['dnsomatic','DNS-O-Matic'],
        //             ['freedns','FreeDNS'],
        //             ['google','Google'],
        //             //['cloudflare','Cloudflare'] // does not work - needs ddclient 3.8.3
        //            ]
        // }, {
        //     xtype: 'textfield',
        //     fieldLabel: 'Username'.t(),
        //     bind: '{settings.dynamicDnsServiceUsername}'
        // }, {
        //     xtype: 'textfield',
        //     fieldLabel: 'Password'.t(),
        //     bind: '{settings.dynamicDnsServicePassword}',
        //     inputType: 'password'
        // }, {
        //     xtype: 'textfield',
        //     fieldLabel: 'Hostname(s)'.t(),
        //     bind: '{settings.dynamicDnsServiceHostnames}',
        // }]
    // }]
});
