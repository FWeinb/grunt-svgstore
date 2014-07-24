/*
 * grunt-svgstore
 * https://github.com/FWeinb/grunt-svgstore
 *
 * Copyright (c) 2014 Fabrice Weinberg
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    svgstore: {
      defaults: {
        options: {
        },
        files: {
          'tmp/default_options.svg': ['test/fixtures/codepen.svg']
        },
      },

      prefix: {
        options:{
          prefix: 'icon-'
        },
        files: {
          'tmp/prefix.svg': ['test/fixtures/codepen.svg']
        }
      },

      svgattr: {
        options:{
          svg: {
            viewBox : '0 0 100 100'
          }
        },
        files: {
          'tmp/svg_attr.svg': ['test/fixtures/codepen.svg']
        }
      },

      symbolattr: {
        options:{
          symbol: {
            preserveAspectRatio: 'xMinYMin slice'
          }
        },
        files: {
          'tmp/symbol_attr.svg': ['test/fixtures/codepen.svg']
        }
      },

      formatting: {
        options: {
          formatting : {
            indent_size : 2
          }
        },
        files: {
          'tmp/formatting.svg': ['test/fixtures/codepen.svg']
        },
      },

      withurlref: {
        options:{},
        files: {
          'tmp/withurlref.svg': ['test/fixtures/element.svg']
        }
      },

      includedemo: {
        options:{
          includedemo : true
        },
        files: {
          'tmp/includedemo.svg': ['test/fixtures/*.svg']
        }
      },

      cutNameAfterFirstDot: {
        options:{},
        files: {
          'tmp/cutnameafterfirstdot.svg': ['test/fixtures/naming/*']
        }
      },

      cleanup: {
        options: {
          cleanup: true
        },
        files: {
          'tmp/cleanup.svg': ['test/fixtures/cleanup.svg']
        }
      },

      removeunreferencedids: {
        options: {
          cleanup: true
        },
        files: {
          'tmp/no_unref_ids.svg': ['test/fixtures/usingdef.svg']
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'svgstore', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
