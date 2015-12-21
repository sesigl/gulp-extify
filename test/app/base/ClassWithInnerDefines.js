/**
 * comments
 */
Ext.define('ClassWithInnerDefines', {
    requires : ['ClassThatRequiresClassWithInnerDefines'],


    createDefaultStoreWithData : function(data, fields) {
        var gridModel = Ext.define('DynamicGridModel', {
            extend : 'Ext.data.Model',
            fields : fields,
            idProperty : 'pk'
        });

    },

    createDefaultStore : function() {
        var gridModel = Ext.define('DynamicGridModel', {
            extend : 'Ext.data.Model',
            idProperty : 'pk'
        });


    }

});
