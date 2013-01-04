module.exports = function( grunt ) {
	grunt.initConfig({
		pkg: "<json:package.json>",
		meta: {
			version: "<%= pkg.version %>",
			banner: "/*! Tetra.js v<%= pkg.version %> | (MIT Licence) (c) Viadeo/APVO Corp */"
		},
		concat: {
			"dist/<%=meta.version%>/tetra-core.js": [
				"src/tetra.js",
				"lib/requirejs/require.js",
				"src/conf/requirejs/client.js",
				"src/view/client-micro-tmpl.js",
				"src/view/tetra-view.js",
				"src/controller/tetra-controller.js",
				"src/model/tetra-model.js"
			],
			"dist/<%=meta.version%>/tetra.js": [
				"dist/<%=meta.version%>/tetra-core.js",
				"src/conf/default.js"
			],
			"dist/<%=meta.version%>/tetra-prototype.js": [
                "lib/sizzle/sizzle.js",
                "lib/jquery/1.8.3/jquery-nosizzle.js",
                "lib/JSON-js/json2.js",
                "lib/prototype/1.6.1/prototype.js",
                "lib/scriptaculous/1.8.2/scriptaculous.js",
                "lib/scriptaculous/1.8.2/builder.js",
                "lib/scriptaculous/1.8.2/effects.js",
                "lib/scriptaculous/1.8.2/dragdrop.js",
                "lib/scriptaculous/1.8.2/controls.js",
				"src/tetra.js",
				"src/view/connectors/jquery-connector.js",
				"src/view/connectors/prototype-connector.js",
				"src/view/connectors/builder.js",
				"lib/requirejs/require.js",
				"src/conf/requirejs/client.js",
				"src/view/client-micro-tmpl.js",
				"src/view/tetra-view.js",
				"src/controller/tetra-controller.js",
				"src/model/tetra-model.js",
			]
		},
		lint: {
			files: ["dist/<%=meta.version%>/tetra.js"]
		},
		jshint: {
			options: {
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
				smarttabs: true,
				asi: true,
				lastsemic: true,
                evil: true  // For templating
			},
			globals: {
				tetra: true,
				Sizzle: true,
				requirejs: true,
				VNS: true,
                module: true,
                exports: true,
                tmpl: true
			}
		},
		min: {
			"dist/<%=meta.version%>/tetra-core.min.js": ["<banner>", "dist/<%=meta.version%>/tetra-core.js"],
			"dist/<%=meta.version%>/tetra.min.js": ["<banner>", "dist/<%=meta.version%>/tetra.js"],
			"dist/<%=meta.version%>/tetra-prototype.min.js": ["<banner>", "dist/<%=meta.version%>/tetra-prototype.js"]
		},
		jasmine: {
			folder: {
				src: "test/specs"
			}
		}
	});

	// Default task.
	grunt.registerTask("default", "lint concat");
};
