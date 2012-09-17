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
		}
	});

	// Default task.
	grunt.registerTask('default', 'concat min');
};