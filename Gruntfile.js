module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'public/javascripts/app.js',
        dest: 'public/javascripts/app.min.js'
      }
    },
    jshint: {
      gruntfile: {
        src: "Gruntfile.js",
        options: {
          laxcomma: true
        }
      },
      src: {
        src: "src/javascripts/**/*.js",
        options: {
          laxcomma: true,
          ignores: [
            "src/javascripts/vendor/**/*.js"
          ]
        }
      }
    },
    stylus: {
      compile: {
        files: {
          "public/stylesheets/app.css": ["src/stylus/app.styl"]
        }
      }
    },
    requirejs: {
      development: {
        options: {
          useStrict: true,
          optimize: '',
          baseUrl: 'src/javascripts',
          out: 'public/javascripts/app.js',
          name: 'app',
          mainConfigFile: './src/config/require.js',
          insertRequire: ["http://localhost:35729/livereload.js"],
          paths: {
            config: '../config/development'
          }
        }
      },
      production: {
        options: {
          useStrict: true,
          optimize: 'uglify2',
          preserveLicenseComments: false,
          generateSourceMaps: true,
          baseUrl: 'src/javascripts',
          out: 'public/javascripts/app.js',
          name: 'app',
          mainConfigFile: './src/config/require.js',
          paths: {
            config: '../config/production'
          }
        }
      }
    },
    watch: {
      gruntfile: {
        files: ["Gruntfile.js"],
        tasks: ["jshint:gruntfile"]
      },
      stylus: {
        options: { atBegin: true },
        files: ["src/stylus/**/*.styl"],
        tasks: ["stylus:compile"]
      },
      livereload: {
        files: ["public/**/*.js", "public/index.html"],
        options: { livereload: true },
      },
      livereloadCSS: {
        files: ["public/**/*.css"],
        options: { livereload: true },
      },
      src: {
        options: { atBegin: true, },
        files: ["src/javascripts/**/*.js", "src/javascripts/templates/**/*.html"],
        tasks: ["requirejs:development", "jshint:src"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-jasmine");
  grunt.loadNpmTasks("grunt-contrib-stylus");
  grunt.loadNpmTasks("grunt-contrib-requirejs");
  grunt.loadNpmTasks("grunt-notify");

  grunt.registerTask("default", "watch");
  grunt.registerTask("heroku:production", ["stylus", "requirejs:production"]);
};
