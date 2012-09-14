config.init({
	meta: {
		title: 'Tetra.js',
		name: "Viadeo/APVO Corp., Olivier Hory and other Tetra contributors",
		homepage: 'http://www.viadeo.com',
		banner: '/* \n' +
				' * \tAuthor:\t\t{{meta.name}}\n' +
				' * \tWebsite:\t{{meta.homepage}}\n' +
				' * \n' +
				' */'
	},
	watch: {
		files: ["lib/*.js"],
		tasks: 'default'
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
	}
});

// Default task.
task.registerTask('default', 'concat min watch');