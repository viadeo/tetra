module.exports = function( grunt ) {
	grunt.initConfig({
		pkg: "<json:package.json>",
		meta: {
			banner: "/*! Tetra.js v<%= pkg.version %> | (MIT Licence) (c) Viadeo/APVO Corp */"
		},
		concat: {
			'dist/tetra-<%= pkg.version %>.js': [
				"lib/tetra.js",
				"lib/deps/require.js",
				"lib/mod/require/client.js",
				"lib/mod/tmpl/client-micro-tmpl.js",
				"lib/tetra-view.js",
				"lib/tetra-controller.js",
				"lib/tetra-model.js",
				"lib/conf/default.js"
			],
			'dist/tetra-viadeo-<%= pkg.version %>.js': [
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
			dist: ['dist/tetra-<%= pkg.version %>.min.js', 'dist/tetra-viadeo-<%= pkg.version %>.min.js']
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				eqnull: true,
				browser: true,
				jquery: true,
				prototypejs: true,
				devel: true,
				smarttabs: true
			},
			globals: {
				tetra: true,
				Sizzle: true,
				requirejs: true,
				VNS: true
			}
		},
		min: {
			'dist/tetra-<%= pkg.version %>.min.js': ['<banner>', 'dist/tetra-<%= pkg.version %>.js'],
			'dist/tetra-viadeo-<%= pkg.version %>.min.js': ['<banner>', 'dist/tetra-viadeo-<%= pkg.version %>.js']
		},
		jasmine: {
			folder: {
				src: "spec/javascripts/specs/core"
			}
		}
	});

	// Default task.
	grunt.registerTask('default', 'concat min');
	grunt.registerTask('default', 'concat min jshint');
};