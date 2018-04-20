Ext.define('Ung.Setup.Wireless', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.Wireless',

    title: 'Wireless'.t(),
    description: 'Configure Wireless Settings'.t(),

    layout: {
        type: 'center'
    },
    items: [{
        xtype: 'container',
        width: 200,
        padding: '0 0 100 0',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        defaults: {
            labelAlign: 'top',
            msgTarget: 'side',
            validationEvent: 'blur',
        },
        items: [{
            xtype: 'component',
            cls: 'sectionheader',
            // margin: '30 0 0 0',
            html: 'Settings'.t()
        }, {
            xtype: 'textfield',
            fieldLabel: 'Network Name (SSID)'.t(),
            width: 350,
            maxLength: 30,
            maskRe: /[a-zA-Z0-9\-_=]/,
            bind: {
                value: '{wirelessSettings.ssid}'
            },
            allowBlank: false
        }, {
            xtype: 'combo',
            fieldLabel: 'Encryption'.t(),
            width: 300,
            editable: false,
            store: [['NONE', 'None'.t()], ['WPA1', 'WPA'.t()], ['WPA12', 'WPA / WPA2'.t()], ['WPA2', 'WPA2'.t()]],
            bind: {
                value: '{wirelessSettings.encryption}'
            }
        }, {
            xtype: 'textfield',
            fieldLabel: 'Password'.t(),
            width: 350,
            maxLength: 63,
            minLength: 8,
            maskRe: /[a-zA-Z0-9~@#%_=,\!\-\/\?\(\)\[\]\\\^\$\+\*\.\|]/,
            bind: {
                value: '{wirelessSettings.password}'
            },
            validator: function (val) {
                if (!val || val.length < 8) {
                    return 'The wireless password must be at least 8 characters.'.t();
                }
                if (val === '12345678') {
                    return 'You must choose a new and different wireless password.'.t();
                }
                return true;
            }
        }]
    }],

    listeners: {
        save: 'onSave'
    },

    controller: {
        onSave: function (cb) {
            cb();
        }
    }
});
