/**
 * Created by sebastian2015 on 10.05.2015.
 */
Ext.define('My.controller.MultipleDefinitionsInOneFileController1', {
    extend: 'My.base.Root'
});

Ext.define('My.controller.MultipleDefinitionsInOneFileController2', {
    extend: 'My.controller.MultipleDefinitionsInOneFileController1'
});

Ext.define('My.controller.MultipleDefinitionsInOneFileController3', {
    extend: 'My.mixin.MyMixin',
    myFunction: function() {
        Ext.define('My.innerFunction.shouldNotBeHandledAsACustomClassDefinition', {
            extend : 'Ext.data.Model',
            fields : []
        });
    }
});