Ext.define('My.Application', {
    extend: 'Ext.app.Application',

    requires: [
        'AnotherClass',
        'My.controller.Root',
        'My.controller.CircDepControllerOne',
        'ExternalClass'
    ],

    controllers: [
        'Root@Ticket.controller'
    ],

    onBeforeLaunch: function () {
        this.callParent();
    }
});
