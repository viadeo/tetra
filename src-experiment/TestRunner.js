require.config({
	baseUrl: "/src",
	paths: {
		jquery: 'lib/jquery',
		specs: '../test/specs'
	},
	packages: [
		{
			"name": "when",
			"location": "lib/when",
			"main": "when"
		}
	]
});

require(['jquery'], function($) {
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