Ext.define('Ung.graph.PieGraph', {
    extend: 'Ext.Container',
    alias: 'widget.piegraph',

    items: [{
        html: 'pie'
    }],

    controller: {
        onInitialized: function () {
            console.log('pie initialized');
        }
    }
});
