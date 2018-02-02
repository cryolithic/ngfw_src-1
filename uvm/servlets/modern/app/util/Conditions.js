Ext.define('Ung.util.Condition', {
    singleton: true,
    alternateClassName: 'Condition',

    DST_ADDR: {
        conditionType: 'DST_ADDR',
        text: 'Destination Address'.t(),
        type: 'textfield'
    },
    DST_PORT: {
        conditionType: 'DST_PORT',
        text: 'Destination Port'.t(),
        type: 'textfield'
    },
    DST_INTF: {
        conditionType: 'DST_INTF',
        text: 'Destination Interface'.t(),
        type: 'menucheckitem',
        values: [
            { text: 'Any', value: 'any' },
            { text: 'Any Non-WAN', value: 'non_wan' },
            { text: 'Any WAN', value: 'wan' },
            { text: 'External', value: '1' },
            { text: 'Internal', value: '2' },
            { text: 'vlan test', value: '100' },
            { text: 'vlan 2', value: '101' },
            { text: 'vlan 3', value: '102' },
            { text: 'OpenVPN', value: '250' },
            { text: 'L2TP', value: '251' },
            { text: 'XAUTH', value: '252' },
            { text: 'GRE', value: '253' }
        ]
    },
    SRC_ADDR: {
        conditionType: 'SRC_ADDR',
        text: 'Source Address'.t(),
        type: 'textfield'
    },
    SRC_PORT: {
        conditionType: 'SRC_PORT',
        text: 'Source Port'.t(),
        type: 'textfield'
    },
    SRC_INTF: {
        conditionType: 'SRC_INTF',
        text: 'Source Interface'.t(),
        type: 'menucheckitem',
        values: [
            { text: 'Any', value: 'any' },
            { text: 'Any Non-WAN', value: 'non_wan' },
            { text: 'Any WAN', value: 'wan' },
            { text: 'External', value: '1' },
            { text: 'Internal', value: '2' },
            { text: 'vlan test', value: '100' },
            { text: 'vlan 2', value: '101' },
            { text: 'vlan 3', value: '102' },
            { text: 'OpenVPN', value: '250' },
            { text: 'L2TP', value: '251' },
            { text: 'XAUTH', value: '252' },
            { text: 'GRE', value: '253' }
        ]
    },
    PROTOCOL: {
        conditionType: 'PROTOCOL',
        text: 'Protocol'.t(),
        type: 'menucheckitem',
        values: [
            { text: 'TCP', value: 'TCP' },
            { text: 'UDP', value: 'UDP' },
            { text: 'ICMP', value: 'ICMP' },
            { text: 'GRE', value: 'GRE' },
            { text: 'ESP', value: 'ESP' },
            { text: 'AH', value: 'AH' },
            { text: 'SCTP', value: 'SCTP' }
        ]
    },
    CLIENT_TAGGED: {
        conditionType: 'CLIENT_TAGGED',
        text: 'Client Tagged'.t(),
        type: 'textfield'
    },
    SERVER_TAGGED: {
        conditionType: 'SERVER_TAGGED',
        text: 'Server Tagged'.t(),
        type: 'textfield'
    },
    HOST_IN_PENALTY_BOX: {
        conditionType: 'HOST_IN_PENALTY_BOX',
        text: 'Host in Penalty Box'.t(),
        type: 'menuradioitem'
    }
});

// Ext.define('Ung.util.Condition', {
//     singleton: true,
//     alternateClassName: 'Condition',

//     DST_ADDR: {
//         type: 'DST_ADDR',
//         // name: 'DST_ADDR',
//         text: 'Destination Address'.t(),
//         menu: {
//             defaultType: 'textfield',
//             items: [
//                 { placeholder: 'enter address', iconCls: 'x-fa fa-font' }
//             ]
//         }
//     },

//     DST_PORT: {
//         type: 'DST_PORT',
//         // name: 'DST_ADDR',
//         text: 'Destination Port'.t(),
//         menu: {
//             defaultType: 'textfield',
//             items: [
//                 { placeholder: 'enter address', iconCls: 'x-fa fa-font' }
//             ]
//         }
//     },

//     DST_INTF: {
//         type: 'DST_INTF',
//         text: 'Destination Interface'.t(),
//         menu: {
//             defaultType: 'menucheckitem',
//             masked: {
//                 xtype: 'mask'
//             },
//             defaults: {
//                 listeners: {
//                     checkchange: function (el, checked) {
//                         console.log(checked);
//                     }
//                 }
//             },
//             items: [
//                 { text: 'Any', value: 'any' },
//                 { text: 'Any Non-WAN', value: 'non_wan' },
//                 { text: 'Any WAN', value: 'wan' },
//                 { text: 'External', value: '1' },
//                 { text: 'Internal', value: '2' },
//                 { text: 'vlan test', value: '100' },
//                 { text: 'vlan 2', value: '101' },
//                 { text: 'vlan 3', value: '102' },
//                 { text: 'OpenVPN', value: '250' },
//                 { text: 'L2TP', value: '251' },
//                 { text: 'XAUTH', value: '252' },
//                 { text: 'GRE', value: '253' }
//             ]
//         }
//     },

//     SRC_ADDR: {
//         type: 'SRC_ADDR',
//         text: 'Source Address'.t(),
//         menu: {
//             defaultType: 'textfield',
//             items: [
//                 { placeholder: 'enter address', iconCls: 'x-fa fa-font' }
//             ]
//         }
//     },

//     SRC_PORT: {
//         type: 'SRC_PORT',
//         text: 'Source Port'.t(),
//         menu: {
//             defaultType: 'textfield',
//             items: [
//                 { placeholder: 'enter address', iconCls: 'x-fa fa-font' }
//             ]
//         }
//     },

//     SRC_INTF: {
//         type: 'SRC_INTF',
//         text: 'Destination Interface'.t(),
//         menu: {
//             defaultType: 'menucheckitem',
//             items: [
//                 { text: 'Any', value: 'any' },
//                 { text: 'Any Non-WAN', value: 'non_wan' },
//                 { text: 'Any WAN', value: 'wan' },
//                 { text: 'External', value: '1' },
//                 { text: 'Internal', value: '2' },
//                 { text: 'vlan test', value: '100' },
//                 { text: 'vlan 2', value: '101' },
//                 { text: 'vlan 3', value: '102' },
//                 { text: 'OpenVPN', value: '250' },
//                 { text: 'L2TP', value: '251' },
//                 { text: 'XAUTH', value: '252' },
//                 { text: 'GRE', value: '253' }
//             ]
//         }
//     },

//     PROTOCOL: {
//         type: 'PROTOCOL',
//         text: 'Protocol'.t(),
//         menu: {
//             defaultType: 'menucheckitem',
//             items: [
//                 { text: 'TCP' },
//                 { text: 'UDP' },
//                 { text: 'ICMP' },
//                 { text: 'GRE' },
//                 { text: 'ESP' },
//                 { text: 'AH' },
//                 { text: 'SCTP' }
//             ]
//         }
//     },

//     CLIENT_TAGGED: {
//         type: 'CLIENT_TAGGED',
//         text: 'Client Tagged'.t(),
//         menu: {
//             defaultType: 'textfield',
//             items: [
//                 { placeholder: 'enter address', iconCls: 'x-fa fa-font' }
//             ]
//         }
//     },

//     SERVER_TAGGED: {
//         type: 'SERVER_TAGGED',
//         text: 'Server Tagged'.t(),
//         menu: {
//             defaultType: 'textfield',
//             items: [
//                 { placeholder: 'enter address', iconCls: 'x-fa fa-font' }
//             ]
//         }
//     }

// });
