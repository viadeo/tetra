module.exports = function( grunt ) {
	grunt.initConfig({
		pkg: "<json:package.json>",
		meta: {
			version: "<%= pkg.version %>",
			banner: "/*! Tetra.js v<%= pkg.version %> | (MIT Licence) (c) Viadeo/APVO Corp */"
		},
		concat: {
			"release/tetra-core.js": [
				"src/tetra.js",
				"lib/requirejs/require.js",
				"src/conf/requirejs/client.js",
				"src/view/client-micro-tmpl.js",
				"src/view/tetra-view.js",
				"src/controller/tetra-controller.js",
				"src/model/tetra-model.js"
			],
			"release/tetra.js": [
				"release/tetra-core.js",
				"src/conf/default.js"
			],
			"release/tetra-prototype.js": [
                "lib/sizzle/sizzle.js",
                "lib/jquery/1.9.1/jquery-nosizzle.js",
                "lib/jquery/1.9.1/jquery.browser.js",
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
				"src/model/tetra-model.js"
			],
			"release/tetra-jquery.js": [
    			"lib/sizzle/sizzle.js",
                "lib/jquery/1.9.1/jquery-nosizzle.js",
                "lib/jquery/1.9.1/jquery.browser.js",
                "lib/JSON-js/json2.js",
                "src/tetra.js",
				"src/view/connectors/jquery-connector.js",
				"src/view/connectors/builder.js",
				"lib/requirejs/require.js",
				"src/conf/requirejs/client.js",
				"src/view/client-micro-tmpl.js",
				"src/view/tetra-view.js",
				"src/controller/tetra-controller.js",
				"src/model/tetra-model.js"
			]
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
				loopfunc: true,
				validthis: true,
                evil: true,  // For templating
				globals: {
					tetra: true,
					Sizzle: true,
					requirejs: true,
					VNS: true,
					module: true,
					exports: true,
					tmpl: true,
					tns: true,
					define: true,
					require: true,
					extend: true
				}
			},
			files: ["src/tetra.js",
					"src/view/connectors/**/builder.js",
					"src/view/connectors/**/jquery-connector.js",
					"src/view/connectors/**/prototype-connector.js",
					"src/view/client-micro-tmpl.js",
					"src/view/tetra-view.js",
					"src/controller/tetra-controller.js",
					"src/model/tetra-model.js"]
		},
		min: {
			"release/<%=meta.version%>/tetra-core.min.js": ["<banner>", "release/tetra-core.js"],
			"release/<%=meta.version%>/tetra.min.js": ["<banner>", "release/tetra.js"],
			"release/<%=meta.version%>/tetra-prototype.min.js": ["<banner>", "release/tetra-prototype.js"],
			"release/<%=meta.version%>/tetra-jquery.min.js": ["<banner>", "release/tetra-jquery.js"]
		},
		uglify: {
    		build : {
                options: {
                    // the banner is inserted at the top of the output
                    banner: "/*! Tetra.js v<%= pkg.version %> | (MIT Licence) (c) Viadeo/APVO Corp */\n"
                },
        		files : {
                    "release/tetra-core.min.js": ["release/tetra-core.js"],
        			"release/tetra.min.js": ["release/tetra.js"],
        			"release/tetra-prototype.min.js": ["release/tetra-prototype.js"],
        			"release/tetra-jquery.min.js": ["release/tetra-jquery.js"]
    			}
			}
        },
		jasmine: {
			folder: {
				src: "test/specs"
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// Default task.
	grunt.registerTask("default", ["jshint", "concat", "uglify"]);
};