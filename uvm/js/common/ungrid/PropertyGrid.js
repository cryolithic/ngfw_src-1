Ext.define('Ung.cmp.PropertyGrid', {
    extend: 'Ext.grid.property.Grid',
    alias: 'widget.unpropertygrid',

    controller: 'unpropertygrid',

    editable: false,
    width: Renderer.calculateWith(4),
    split: true,
    collapsible: true,
    resizable: true,
    shadow: false,
    animCollapse: false,
    titleCollapse: true,
    collapsed: false,

    cls: 'prop-grid',

    disableSelection: true,

    viewConfig: {
        enableTextSelection: true,
        getRowClass: function(record) {
            var cls = 'x-selectable'; // NGFW-11399 force selectable text
            if (record.get('value') === null || record.get('value') === '') {
                cls += ' empty';
            }
            return cls;
        }
    },

    nameColumnWidth: 200,

    listeners: {
        beforeedit: function () {
            return false;
        },
        beforeexpand: 'onBeforeExpand',
        beforerender: 'onBeforeRender'
    }
});
