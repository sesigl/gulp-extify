/**
 *
 */
Ext.define('My.controller.NoReqController', {
    extend: 'My.base.Root',
    mixins: {
        myMixin: 'My.mixin.MyMixin',
        myOtherMixin: 'My.mixin.MyOtherMixin'
    }
});