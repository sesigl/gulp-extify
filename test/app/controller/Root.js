/**
 *
 */
Ext.define('My.controller.Root', {
    extend: 'My.base.Root',
    mixins: {
        myMixin: 'My.mixin.MyMixin',
        myOtherMixin: 'My.mixin.MyOtherMixin'
    }
});