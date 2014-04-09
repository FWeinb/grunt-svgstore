/*
 * grunt-svgstore
 * https://github.com/FWeinb/grunt-svgstore
 *
 * Copyright (c) 2014 Fabrice Weinberg
 * Licensed under the MIT license.
 */

'use strict';
module.exports = function(grunt) {

  var crypto   = require('crypto'),
      path     = require('path'),

      beautify = require('js-beautify').html,
      cheerio  = require('cheerio'),
      chalk    = require('chalk');

  var md5 = function(str){
    return crypto.createHash('md5').update(str).digest('hex');
  };

  // Matching an url() reference. To correct references broken by making ids unquie to the source svg
  var urlPattern = /url\(\s*#([^ ]+?)\s*\)/g;

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('svgstore', 'Merge SVGs from a folder.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      prefix : '',
      svg : { },
      formatting : false
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

        // Map to store references from id to uniqueId + id;
        var mappedIds = {};

        // Make IDs unique
        $('[id]').each(function(){
          var $elem = $(this);
          var id = $elem.attr('id');
          var newId = uniqueId + id;
          mappedIds[id] = newId;
          $elem.attr('id', newId);
        });

        // Search for an url() reference in every attribute of every tag
        // replace the id with the unique one.
        $('*').each(function(){
          for ( var attr in this[0].attribs){
            var value = this[0].attribs[attr];
            var match;
            while ( ( match = urlPattern.exec(value)) !== null){
              if ( mappedIds[match[1]] !== undefined) {
                value = value.replace(match[0], 'url(#' + mappedIds[match[1]] + ')');
              } else {
                grunt.log.warn('Can\'t reference to id "' + match[1] + '" from attribute "' + attr + '" in "' + this[0].name + '" because it is not defined.');
              }
            }
            this[0].attribs[attr] = value;
          }
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

        // Append to resulting SVG
        $resultDefs.append( $res.html() );

      });

      var result = options.formatting ? beautify($resultDocument.html(), options.formatting) : $resultDocument.html();

      grunt.file.write(f.dest, result);

      grunt.log.writeln('File ' + chalk.cyan(f.dest) + ' created.');

    });


  });

};
