Ext.define('My.Application', {
    extend: 'Ext.app.Application',

    requires: [
        'My.controller.Root'
    ],

    controllers: [
        'Root@Ticket.controller'
    ],

    onBeforeLaunch: function () {
        this.callParent();
    }
});
