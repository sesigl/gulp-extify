Ext.define('My.AllowTabIntentionsApplication', {
	extend:
		'Ext.app.Application'

	,

	mixins: [
		'Ext.app.Mixin',
		'Ext.app.Mixin2'
	]

		,

	model:
		'Ext.app.Model'

	,

	requires

		:
		[

		'SomeClass',

		'SomeClass2'
	]


});
