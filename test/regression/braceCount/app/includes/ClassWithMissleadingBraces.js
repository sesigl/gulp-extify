Ext.define('ClassWithMissleadingBraces', {

    methodwithRegexp : function() {
        var str = "someContent";
        return str.replace(/}\'}}\/"{{/, '');
    },

    methodWithString : function() {
        var str = "abc}dad{asd'sd{as\"dasd{";
        var str = 'abc}dad{a\'sdsd{asdasd{';
        return str;
    }

});