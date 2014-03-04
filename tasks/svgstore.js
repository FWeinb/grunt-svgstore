/*
 * grunt-svgstore
 * https://github.com/FWeinb/grunt-svgstore
 *
 * Copyright (c) 2014 Fabrice Weinberg
 * Licensed under the MIT license.
 */

'use strict';
module.exports = function(grunt) {

  var crypto  = require('crypto'),
      path    = require('path'),

      cheerio = require('cheerio'),
      chalk   = require('chalk');

  var md5 = function(str){
    return crypto.createHash('md5').update(str).digest('hex');
  };

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('svgstore', 'Merge SVGs from a folder.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      prefix : '',
      svg : { }
    });

    this.files.forEach(function(f) {
      var $resultDocument = cheerio.load('<svg><defs></defs></svg>'),
          $resultSvg  = $resultDocument('svg'),
          $resultDefs = $resultDocument('defs').first();

      // Merge in SVG attributes
      for ( var attr in options.svg ){
        $resultSvg.attr(attr, options.svg[attr]);
      }

      f.src.filter(function(filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('File "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath){
        var contentStr = grunt.file.read(filepath),
            uniqueId   = md5(contentStr),
            $          = cheerio.load(contentStr, { ignoreWhitespace: true, xmlMode: true });

        // Make IDs unique
        $('[id]').each(function(){
          var $elem = $(this);
          $elem.attr('id', uniqueId + $elem.attr('id'));
        });

        var filename  = path.basename(filepath, '.svg'),
            $svg      = $('svg'),
            $children = $svg.children();


        var resultStr;

        // Use the first element
        if ( $children.length === 1){
         resultStr =  $svg.html();

        } else { // Wrap the SVG in a <g>-Tag
         resultStr =  '<g>' + $svg.html() + '</g>';
        }

        // Create a object
        var $res = cheerio.load(resultStr);

        // Add ID to the first Element
        $res('*').first().attr('id', options.prefix + filename);

        // Insert in resutling SVG
        $resultDefs.append( $res.html() );

      });


      grunt.file.write(f.dest, $resultDocument.html());

      grunt.log.writeln('File ' + chalk.cyan(f.dest) + ' created.');

    });


  });

};
