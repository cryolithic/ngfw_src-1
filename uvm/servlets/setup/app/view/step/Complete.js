Ext.define('Ung.Setup.Complete', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.Complete',

    title: 'Complete'.t(),
    description: 'Complete'.t(),

    layout: 'center',
    items: [{
        xtype: 'container',
        layout: {
            type: 'vbox',
            align: 'middle'
        },
        items: [{
            xtype: 'component',
            style: { textAlign: 'center' },
            html: Ext.String.format('<b>The {0} Server is now configured.</b><br/><br/>You are now ready to configure the applications.'.t(), rpc.oemName)
        }, {
            xtype: 'button',
            margin: '30 0 0 0',
            text: 'Done'.t(),
            iconCls: 'fa fa-check',
            handler: function () {
                Ext.MessageBox.wait('Loading User Interface...'.t(), 'Please Wait'.t());
                //and set a flag so the wizard wont run again
                rpc.jsonrpc.UvmContext.wizardComplete(function (result, ex) {
                    if (ex) { Util.handleException(ex); return; }
                    window.location.href = '/admin/index.do';
                });
            }
        }]
    }]
});
