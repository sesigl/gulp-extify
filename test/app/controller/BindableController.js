/**
 *
 */
Ext.define('My.controller.BindableController', {
    extend: 'Ext.app.ViewController',
    mixins: ['My.mixin.BindableMixin', 'My.mixin.BindableMixinOther']
});