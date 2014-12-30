/*
 * grunt-svgstore
 * https://github.com/FWeinb/grunt-svgstore
 *
 * Copyright (c) 2014 Fabrice Weinberg
 * Licensed under the MIT license.
 */

'use strict';

var multiline = require('multiline');

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
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
        options: {
          prefix: 'icon-'
        },
        files: {
          'tmp/prefix.svg': ['test/fixtures/codepen.svg']
        }
      },

      svgattr: {
        options: {
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

      nestedsymboleid: {
        options:{},
        files: {
          'tmp/nestedsymbol.svg': ['test/fixtures/nestedsymbol.svg']
        }
      },

      includedemo: {
        options:{
          includedemo : true
        },
        files: {
          'tmp/includedemo.svg': ['test/fixtures/*.svg', 'test/fixtures/animation/anim.svg']
        }
      },

      cutNameAfterFirstDot: {
        options:{},
        files: {
          'tmp/cutnameafterfirstdot.svg': ['test/fixtures/naming/name.min.svg']
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

      cleanupwithcurrentcolor: {
        options: {
          cleanup: true
        },
        files: {
          'tmp/cleanup_with_currentColor.svg': ['test/fixtures/cleanup_with_currentColor.svg']
        }
      },

      preserveattribute: {
        options: {
          cleanup: ['fill', 'stroke', 'imafake']
        },
        files: {
          'tmp/preserve_attribute.svg': ['test/fixtures/preserve_attribute.svg']
        }
      },
      cleanupwithinheritviewbox: {
        options: {
          cleanup: true,
          inheritviewbox: true
        },
        files: {
          'tmp/cleanup_with_inheritviewbox.svg': ['test/fixtures/cleanup.svg']
        }
      },

      removeunreferencedids: {
        options: {
          cleanup: ['style', 'id'],
          cleanupdefs: true
        },
        files: {
          'tmp/no_unref_ids.svg': ['test/fixtures/usingdef.svg']
        }
      },

      cleanupfill: {
        options: {
          cleanup: ['fill']
        },
        files: {
          'tmp/cleanup_fill.svg': ['test/fixtures/dribbble.svg']
        }
      },

      nocleandefs: {
        options: {
          cleanup: ['style']
        },
        files: {
          'tmp/defs_noclean.svg': ['test/fixtures/usingdef.svg']
        }
      },

      cleandefs: {
        options: {
          cleanup: ['style', 'id'],
          cleanupdefs: true
        },
        files: {
          'tmp/defs_clean.svg': ['test/fixtures/usingdef.svg']
        }
      },

      removeemptyg: {
        options: {
          cleanup: ['id']
        },
        files: {
          'tmp/no_empty_g.svg': ['test/fixtures/scissors.svg']
        }
      },

      perserveAnimation: {
        files: {
          'tmp/anim.svg': ['test/fixtures/animation/anim.svg']
        }
      },

      withCustomTemplate:{
        options: {
          includedemo : multiline.stripIndent(function(){/*
                <!doctype html>
                <html>
                  <head>
                    <style>
                      svg{
                       width:50px;
                       height:50px;
                       fill:black !important;
                      }
                    </style>
                  <head>
                  <body>
                    {{{svg}}}

                    {{#each icons}}
                    <div>
                      <svg>
                        <use xlink:href="#{{name}}" />
                      </svg>
                      <div>{{title}}</div>
                    </div>
                    {{/each}}

                  </body>
                </html>
          */})
        },
        files: {
          'tmp/customTemplate.svg': ['test/fixtures/animation/anim.svg']
        }
      },

      withCustomTemplateFunction: {
        options: {
          includedemo : function(){}
        },
        files: {
          'tmp/customTemplateFunction.svg': ['test/fixtures/animation/anim.svg']
        }
      },

      withCustomIdFunction: {
        options: {
          convertNameToId: function(name) {
            return name.split('_')[1];
          }
        },
        files: {
          'tmp/customIdFunction.svg': ['test/fixtures/naming/SomePrefix_iconName.svg']
        }
      },

      withCustomDefs: {
        options: {
          externalDefs: 'test/fixtures/usingdef.svg'
        },
        files: {
          'tmp/withCustomDefs.svg': ['test/fixtures/itunes.svg']
        }
      },

      noTitleElement: {
        options: {
          includeTitleElement: false
        },
        files: {
          'tmp/no_title_element.svg': ['test/fixtures/codepen.svg']
        }
      },

      noDescElement: {
        options: {
          preserveDescElement: false
        },
        files: {
          'tmp/no_desc_element.svg': ['test/fixtures/codepen.svg']
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

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
