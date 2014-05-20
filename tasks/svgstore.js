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
      multiline= require('multiline'),
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
      svg : {
	'xmlns' : "http://www.w3.org/2000/svg"
      },
      formatting : false,
      includedemo : false
    });

    this.files.forEach(function(file) {

      var $resultDocument = cheerio.load('<svg><defs></defs></svg>'),
          $resultSvg  = $resultDocument('svg'),
	  $resultDefs = $resultDocument('defs').first(),
	  iconNameViewBoxArray = []; // Used to store information of all icons that are added
				     // { name : '', attribute : { 'data-viewBox' : ''}}

      // Merge in SVG attributes
      for ( var attr in options.svg ){
        $resultSvg.attr(attr, options.svg[attr]);
      }

      file.src.filter(function(filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('File "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath){
	var filename  = path.basename(filepath, '.svg'),
	    contentStr = grunt.file.read(filepath),
            uniqueId   = md5(contentStr),
	    $          = cheerio.load(contentStr, {normalizeWhitespace : true, xmlMode: true});

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
	  var $elem = $(this);
	  var attrs = $elem.attr();
	  Object.keys(attrs).forEach(function(key){
	    var value = attrs[key];
            var match;
            while ( ( match = urlPattern.exec(value)) !== null){
              if ( mappedIds[match[1]] !== undefined) {
                value = value.replace(match[0], 'url(#' + mappedIds[match[1]] + ')');
              } else {
                grunt.log.warn('Can\'t reference to id "' + match[1] + '" from attribute "' + attr + '" in "' + this[0].name + '" because it is not defined.');
              }
            }
	    $elem.attr(key, value);
	  });
        });

	var $svg      = $('svg'),
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

	var graphicId = options.prefix + filename;
        // Add ID to the first Element
	$res('*').first().attr('id', graphicId);

        // Append to resulting SVG
	$resultDefs.append( $res.xml() );

	// Add icon to the demo.html array
	if ( options.includedemo ) {
	  iconNameViewBoxArray.push({
	    name : graphicId,
	    attributes : {
	      'viewBox' : $svg.attr('viewBox')
	    }
	  });
	}

      });

      var result = options.formatting ? beautify($resultDocument.xml(), options.formatting) : $resultDocument.xml();
      var destName = path.basename(file.dest, '.svg');

      grunt.file.write(file.dest, result);

      grunt.log.writeln('File ' + chalk.cyan(file.dest) + ' created.');

      if ( options.includedemo ) {

	$resultSvg.attr('style', 'display:none');

	var demoHTML = multiline.stripIndent(function(){/*
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
		    {{svg}}
		    {{useBlock}}
		  </body>
	      </html>
	*/});

	var useBlock = '';
	iconNameViewBoxArray.forEach(function(item){
	  var attrStr = '';

	  Object.keys(item.attributes).forEach(function(key){
	    attrStr += ' ' +key+'="'+item.attributes[key]+'"';
	  });

	  useBlock += '\t\t<svg'+attrStr+'>\n\t\t\t<use xlink:href="#'+ item.name +'"></use>\n\t\t</svg>\n';
	});

	demoHTML = demoHTML.replace('{{svg}}', $resultDocument.xml());
	demoHTML = demoHTML.replace('{{useBlock}}', useBlock);

	var demoPath = path.resolve(path.dirname(file.dest),  destName + '-demo.html' );
	grunt.file.write(demoPath, demoHTML);
	grunt.log.writeln('Demo file ' + chalk.cyan(demoPath) + ' created.');
      }

    });

  });

};
