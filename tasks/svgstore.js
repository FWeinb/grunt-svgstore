/*
 * grunt-svgstore
 * https://github.com/FWeinb/grunt-svgstore
 *
 * Copyright (c) 2014 Fabrice Weinberg
 * Licensed under the MIT license.
 */
'use strict';

module.exports = function (grunt) {
  var crypto = require('crypto');
  var multiline = require('multiline');
  var path = require('path');

  var beautify = require('js-beautify').html;
  var cheerio = require('cheerio');
  var chalk = require('chalk');

  var md5 = function (str) {
    return crypto.createHash('md5').update(str).digest('hex');
  };

  var convertNameToId = function( name ){
    var dotPos = name.indexOf('.');
    if ( dotPos > -1){
      name = name.substring(0, dotPos);
    }
    return name;
  };

  // Matching an url() reference. To correct references broken by making ids unique to the source svg
  var urlPattern = /url\(\s*#([^ ]+?)\s*\)/g;

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('svgstore', 'Merge SVGs from a folder.', function () {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      prefix: '',
      svg: {
          'xmlns': "http://www.w3.org/2000/svg"
      },
      formatting: false,
      includedemo: false,
      symbol: {},
      cleanupdefs: false
    });

    var cleanupAttributes = [];
    if (options.cleanup && typeof options.cleanup === 'boolean') {
      // For backwards compatibility (introduced in 0.2.6).
      cleanupAttributes = ['style'];
    } else if (Array.isArray(options.cleanup)){
      cleanupAttributes = options.cleanup;
    }

    this.files.forEach(function (file) {
      var $resultDocument = cheerio.load('<svg><defs></defs></svg>', { lowerCaseAttributeNames : false }),
          $resultSvg = $resultDocument('svg'),
          $resultDefs = $resultDocument('defs').first(),
          iconNameViewBoxArray = [];  // Used to store information of all icons that are added
                                      // { name : '' }

      // Merge in SVG attributes from option
      for (var attr in options.svg) {
        $resultSvg.attr(attr, options.svg[attr]);
      }

      file.src.filter(function (filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('File "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function (filepath) {
        var filename = path.basename(filepath, '.svg');
        var contentStr = grunt.file.read(filepath);
        var $ = cheerio.load(contentStr, {
              normalizeWhitespace: true,
              xmlMode: true
            });

        // Remove empty g elements
        $('g').each(function(){
          var $elem = $(this);
          if (!$elem.children().length) {
            $elem.remove();
          }
        });

        // Map to store references from id to uniqueId + id;
        var mappedIds = {};
        var uniqueId;

        function getUniqueId(oldId) {
          if (!uniqueId) {
            uniqueId = md5(contentStr);
          }

          return 'svgstore' + uniqueId + oldId;
        }

        $('*').each(function () {
          var $elem = $(this);
          var attrs = $elem.attr();
          Object.keys(attrs).forEach(function (key) {
            var value = attrs[key];
            var match;
            while ((match = urlPattern.exec(value)) !== null) {
              var refId = match[1];

              // Add ID mapping if not already present
              if (!mappedIds[refId]) {
                mappedIds[refId] = getUniqueId(refId);
              }

              $elem.attr(key, value.replace(match[0], 'url(#' + mappedIds[refId] + ')'));
            }

            // IDs are handled separately
            if (key !== 'id') {
              if (options.cleanupdefs || !$elem.parents('defs').length) {
                if (cleanupAttributes.indexOf(key) > -1){
                  $elem.removeAttr(key);
                }
              }
            }
          });
        });

        // Apply ID mapping and remove unreferenced IDs
        $('[id]').each(function () {
          var $elem = $(this);
          var id = $elem.attr('id');
          var newId = mappedIds[id];
          if (!newId && cleanupAttributes.indexOf('id') > -1) {
            // ID is not refenced and can therefore be removed
            $elem.removeAttr('id');
          } else {
            if (!newId) {
              mappedIds[id] = newId = getUniqueId(id);
            }

            // Replace id by mapped id
            $elem.attr('id', newId);
          }
        });

        var $svg = $('svg');
        var $title = $('title');
        var $desc = $('desc');
        var $def = $('defs').first();
        var defContent = $def.length && $def.html();

        // Merge in the defs from this svg in the result defs block
        if (defContent) {
          $resultDefs.append(defContent);
        }

        var title = $title.first().html();
        var desc = $desc.first().html();

        // Remove def, title, desc from this svg
        $def.remove();
        $title.remove();
        $desc.remove();

        var id = convertNameToId(filename);

        // If there is no title use the filename
        title = title || id;

        // Generate symbol
        var $res = cheerio.load('<symbol>' + $svg.html() + '</symbol>', { lowerCaseAttributeNames: false });
        var $symbol = $res('symbol').first();

        // Merge in symbol attributes from option
        for (var attr in options.symbol) {
          $symbol.attr(attr, options.symbol[attr]);
        }

        // Add title and desc (if provided)
        if (desc) {
          $symbol.prepend('<desc>' + desc + '</desc>');
        }

        if (title) {
          $symbol.prepend('<title>' + title + '</title>');
        }

        // Add viewBox (if present on SVG)
        var viewBox = $svg.attr('viewBox');
        if (viewBox) {
          $symbol.attr('viewBox', viewBox);
        }

        // Add ID to symbol
        var graphicId = options.prefix + id;
        $symbol.attr('id', graphicId);

        // Extract gradients and pattern
        var addToDefs = function(){
          var $elem = $res(this);
          $resultDefs.append($elem.toString());
          $elem.remove();
        };

        $res('linearGradient').each(addToDefs);
        $res('radialGradient').each(addToDefs);
        $res('pattern').each(addToDefs);

        // Append <symbol> to resulting SVG
        $resultSvg.append($res.html());

        // Add icon to the demo.html array
        if (options.includedemo) {
          iconNameViewBoxArray.push({
            name: graphicId
          });
        }
      });

      // Remove defs block if empty
      if ( $resultDefs.html().trim() === '' ) {
        $resultDefs.remove();
      }

      var result = options.formatting ? beautify($resultDocument.xml(), options.formatting) : $resultDocument.xml();
      var destName = path.basename(file.dest, '.svg');

      grunt.file.write(file.dest, result);

      grunt.log.writeln('File ' + chalk.cyan(file.dest) + ' created.');

      if (options.includedemo) {
        $resultSvg.attr('style', 'width:0;height:0;visibility:hidden;');

        var demoHTML = multiline.stripIndent(function () { /*
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
        iconNameViewBoxArray.forEach(function (item) {
          useBlock += '\t\t<svg>\n\t\t\t<use xlink:href="#' + item.name + '"></use>\n\t\t</svg>\n';
        });

        demoHTML = demoHTML.replace('{{svg}}', $resultDocument.xml());
        demoHTML = demoHTML.replace('{{useBlock}}', useBlock);

        var demoPath = path.resolve(path.dirname(file.dest), destName + '-demo.html');
        grunt.file.write(demoPath, demoHTML);
        grunt.log.writeln('Demo file ' + chalk.cyan(demoPath) + ' created.');
      }
    });
  });
};
