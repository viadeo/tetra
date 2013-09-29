module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    less: {
       development: {
          options: {
             paths: ["src/less"]
          },
             files: {
             "public/css/main.css": "src/less/main.less"
          }
       },
       production: {
          options: {
             paths: ["src/less"],
             yuicompress: true
          },
          files: {
             "public/css/main.css": "src/less/main.less"
          }
       }
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
          evil: true,
          globals: {
             tetra: true,
             Sizzle: true,
             requirejs: true,
             VNS: true,
             module: true,
             exports: true,
             tmpl: true,
             History: true,
             lang: true
             }
          },
       files: []
    },
    assemble: {
      options: {
      path: '/tetra',
      partials:'doc/templates/partials/**/*.hbs'
    },
    paths: {
      options: {
        flatten:true,
        layout: 'doc/templates/layout/default.hbs'
      },
        files: [
          { expand: true, cwd:'doc/templates/pages', src:['*.hbs','!index.hbs'], dest: 'doc/' },
          { expand: true, cwd:'doc/templates/pages', src:['index.hbs'], dest: './' }
        ]
      }
    },
    clean: {
      doc: ['doc/*.html', 'index.html']
    },
    connect: {
      server: {
         options: {
            hostname: '0.0.0.0',
            port: 8080,
            base: '..'
         }
      }
    },
    watch: {
       less: {
          files: ['src/less/*.less'],
          tasks: ['less']
       },
       doc: {
          files: ['doc/templates/**/*'],
          tasks: ['clean:doc', 'assemble']
       }
    }

  });

  // Load NPM plugins to provide the necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('assemble');

  // Default
  grunt.registerTask('default', ['less', 'assemble']);

  // Debugging
  grunt.registerTask('debug', ['clean', 'assemble']);

  // Tests to be run.
  grunt.registerTask('doc', ['clean:doc','assemble']);

  // Server
  grunt.registerTask('server', ['connect','watch']);

};
