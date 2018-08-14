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

 
    isOdd: function(number) {
        return number % 2 === 1;
    },

    isEven: function(number) {
        if(!isOdd(number)) {//if(number % 2 === 0) {
            return true;
        }

        return false;
    },

    ensureProtocol: function(url) {
        var result = Ext.String.trim(url);
        if (result.indexOf('://') == -1) {
            result = 'http://' + result;
        }
        return result;
    }
});