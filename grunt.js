module.exports = function( grunt ) {
	grunt.initConfig({
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
				"lib/deps/sizzle.js",
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
		min: {
			'dist/tetra.min.js': ['<banner>', 'dist/tetra.js'],
			'dist/tetra-viadeo.min.js': ['<banner>', 'dist/tetra-viadeo.js']
		},
		watch: {
			files: ["lib/*.js"],
			tasks: 'default'
		}
	});

	// Default task.
	grunt.registerTask('default', 'concat min watch');
};