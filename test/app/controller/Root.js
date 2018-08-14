/**
 *
 */
Ext
    .define('My.controller.Root', {
    extend: 'My.base.Root',
    mixins: {
        myMixin: 'My.mixin.MyMixin',
        myOtherMixin: 'My.mixin.MyOtherMixin'
    },

    _getCommonActions: function () {
        var result = [
            { popular: true, iconCls: '', text: 'A text', config: { type: 'text' } },
            { popular: true, iconCls: 'icon-generic-newitem', text: 'New item menu', config: { type: 'newitem' } },
            { popular: true, iconCls: '', text: 'Separator', config: { type: 'separator' } },
            { popular: true, iconCls: 'icon-arrows-right', text: 'Right align', config: { type: 'right' } },
            { popular: false, iconCls: 'icon-arrows-down', text: 'Menu list', config: { type: 'menulist' } },
        ];
        return result;
    },
 
    isOdd: function(number) {
        return number % 2 === 1;
    },

    isEven: function(number) {
        if(!isOdd(number)) {//if(number % 2 === 0) {
            return true;
        }

        return false;
    }
});