require.config({
	baseUrl: "/src",
	paths: {
		jquery: 'lib/jquery',
		sinon: '../test/lib/Sinon.JS/sinon-1.5.2',
		specs: '../test/specs'
	},
	packages: [
		//
		// Model packages
		//

		// Promise library, must implement Promises/A spec
		{
			"name": "promise",
			"location": "lib/when",
			"main": "when"
		},

		// JSON Schema validator lib
		{
			"name": "schema-validator",
			"location": "lib/JSV/lib",
			"main": "jsv"
		},
		// Interface for the JSON Schema validator
		{
			"name": "validator-connector",
			"location": "tetra/model/connectors",
			"main": "jsv"
		},

		// XHR
		{
			"name": "xhr",
			"location": "tetra/model/connectors",
			"main": "jquery-xhr"
		},

		//
		// View packages
		//
		{
			"name": "dom",
			"location": "tetra/view/connectors",
			"main": "jquery-dom-connector"
		},

		//
		// Global packages
		//

		// PubSub lib
		{
			"name": "pubsub",
			"location": "lib/PubSubJS/src",
			"main": "pubsub"
		},
		// Interface for pub/sub
		{
			"name": "bus",
			"location": "tetra/_base/connectors",
			"main": "pubsub"
		}
	]
});

require(['jquery', 'sinon'], function($) {
	var jasmineEnv = jasmine.getEnv(),
		htmlReporter = new jasmine.HtmlReporter(),
		specs = ['specs/kernel.spec', 'specs/MemoryModel.spec'];

	jasmineEnv.addReporter(htmlReporter);

	jasmineEnv.specFilter = function(spec) {
		return htmlReporter.specFilter(spec);
	};

	$(function() {
		require(specs, function() {
			jasmineEnv.execute();
		});
	});
});