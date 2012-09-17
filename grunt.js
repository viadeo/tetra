module.exports = function( grunt ) {
	grunt.initConfig({
		pkg: "<json:package.json>",
		meta: {
			banner: "/*! Tetra.js v<%= pkg.version %> | (MIT Licence) (c) Viadeo/APVO Corp */"
		},
		concat: {
			'dist/tetra.js': [
				"lib/tetra.js",
				"lib/deps/require.js",
				"lib/mod/require/client.js",
				"lib/mod/tmpl/client-micro-tmpl.js",
				"lib/tetra-view.js",
				"lib/tetra-controller.js",
				"lib/tetra-model.js",
				"lib/conf/default.js"
			],
			'dist/tetra-viadeo.js': [
				"lib/tetra.js",
				"lib/deps/jquery/src/sizzle/sizzle.js",
				"lib/deps/mod/libAbstracted/jquery-connector.js",
				"lib/deps/mod/libAbstracted/prototype-connector.js",
				"lib/deps/mod/libAbstracted/builder.js",
				"lib/deps/require.js",
				"lib/mod/require/client.js",
				"lib/mod/tmpl/client-micro-tmpl.js",
				"lib/tetra-view.js",
				"lib/tetra-controller.js",
				"lib/tetra-model.js",
				"lib/conf/viadeo-webapp.js"
			]
		},
		lint: {
			dist: "dist/*.js"
		},
		min: {
			'dist/tetra.min.js': ['<banner>', 'dist/tetra.js'],
			'dist/tetra-viadeo.min.js': ['<banner>', 'dist/tetra-viadeo.js']
		},
		jasmine: {
			folder: {
				src: "spec/javascripts/specs/core"
			}
		}
	});

	// Default task.
	grunt.registerTask('default', 'jasmine concat min');
	
	// Tasks
	grunt.registerMultiTask('jasmine', 'Test unit by jasmine.', function() {
        var jasmine = require("jasmine-node").executeSpecsInFolder;
        var specFolder = this.file.src,
            isVerbose = false,
            showColors = true;
        var onComplete = function(runner, log) {
            if (runner.results().failedCount === 0) {
                grunt.log.writeln('Pass to jasmine unit test : ' + specFolder);
                done(true);
            } else {
                grunt.verbose.error();
                throw grunt.task.taskError("Can't pass to jasmine unit test");
            }
        };

        var done = this.async();
        jasmine(specFolder,
            onComplete,
            isVerbose,
            showColors);
    });
};