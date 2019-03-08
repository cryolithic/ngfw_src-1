Ext.define('Ung.cmp.RecordEditor', {
    extend: 'Ext.window.Window',
    width: 800,
    minHeight: 400,
    maxHeight: Ext.getBody().getViewSize().height - 20,

    xtype: 'ung.cmp.recordeditor',

    controller: 'recordeditor',
    closeAction: 'destroy',
    closable: false,

    viewModel: true,

    disabled: true,
    bind: {
        title: '{windowTitle}',
        disabled: '{!record}'
    },

    cancel: false,
    actions: {
        apply: {
            text: 'Done'.t(),
            formBind: true,
            iconCls: 'fa fa-check',
            handler: 'onApply'
        },
        cancel: {
            text: 'Cancel',
            iconCls: 'fa fa-ban',
            handler: 'onCancel'
        }
    },

    bodyStyle: {
        // background: '#FFF'
    },

    autoShow: true,
    // shadow: false,

    // layout: 'border',

    modal: true,
    // layout: {
    //     type: 'vbox',
    //     align: 'stretch'
    // },
    // scrollable: true,

    layout: 'fit',

    items: [{
        xtype: 'form',
        // region: 'center',
        scrollable: 'y',
        bodyPadding: 10,
        border: false,
        layout: 'anchor',
        defaults: {
            anchor: '100%',
            labelWidth: 180,
            labelAlign : 'right',
        },
        items: [],
        buttons: ['@cancel', '@apply']
    }],

    // initComponent: function () {
    //     var items = this.items;
    //     var form = items[0];

    //     for (var i = 0; i < this.fields.length; i++) {
    //         console.log();
    //         if (this.fields[i].editor) {
    //             if (this.fields[i].getItemId() !== 'conditions') {
    //                 form.items.push(this.fields[i].editor);
    //             } else {
    //                 this.items.push({
    //                     xtype: 'component',
    //                     html: 'some panel'
    //                 });
    //             }
    //         }
    //     }

    //     this.callParent(arguments);

    // }
});
