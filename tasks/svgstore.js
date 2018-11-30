/*
 * grunt-svgstore
 * https://github.com/FWeinb/grunt-svgstore
 *
 * Copyright (c) 2014 Fabrice Weinberg
 * Licensed under the MIT license.
 */
'use strict';

module.exports = function (grunt) {
  var path = require('path');

  var beautify = require('js-beautify').html;
  var cheerio = require('cheerio');
  var chalk = require('chalk');
  var handlebars = require('handlebars');

  // Matching an url() reference. To correct references broken by making ids unique to the source svg
  var urlPattern = /url\(\s*#([^ ]+?)\s*\)/g;

  // Default Template
  var defaultTemplate = `<!doctype html>
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
          <svg>
            <use xlink:href="#{{name}}" />
          </svg>
      {{/each}}

    </body>
  </html>`;

  // Default function used to extract an id from a name
  var defaultConvertNameToId = function (name) {
    var dotPos = name.indexOf('.');
    if (dotPos > -1) {
      name = name.substring(0, dotPos);
    }
    return name;
  };

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('svgstore', 'Merge SVGs from a folder.', function () {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      allowDuplicateItems: false,
      cleanupdefs: false,
      convertNameToId: defaultConvertNameToId,
      externalDefs: false,
      fixedSizeVersion: false,
      formatting: false,
      includedemo: false,
      includeTitleElement: true,
      inheritviewbox: false,
      prefix: '',
      preserveDescElement: true,
      removeEmptyGroupElements: true,
      removeWithId: null,
      setUniqueIds: true,
      svg: {
        'xmlns': 'http://www.w3.org/2000/svg'
      },
      symbol: {}
    });

    var cleanupAttributes = [];
    if (options.cleanup && typeof options.cleanup === 'boolean') {
      // For backwards compatibility (introduced in 0.2.6).
      cleanupAttributes = ['style'];
    } else if (Array.isArray(options.cleanup)) {
      cleanupAttributes = options.cleanup;
    }

    this.files.forEach(function (file) {
      var $resultDocument = cheerio.load('<svg><defs></defs></svg>', { xmlMode: true });

      var $resultSvg = $resultDocument('svg');

      var $resultDefs = $resultDocument('defs').first();

      var fileSrc = options.AllowDuplicateItems ? file.orig.src : file.src;

      var iconNameViewBoxArray = []; // Used to store information of all icons that are added
      // { name : '' }

      // Merge in SVG attributes from option
      for (var attr in options.svg) {
        $resultSvg.attr(attr, options.svg[attr]);
      }

      fileSrc.filter(function (filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('File "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function (filepath) {
        var filename = path.basename(filepath, '.svg');
        var id = options.convertNameToId(filename);
        var contentStr = grunt.file.read(filepath);
        var $ = cheerio.load(contentStr, {
          normalizeWhitespace: true,
          xmlMode: true
        });

        // Remove empty g elements
        if (options.removeEmptyGroupElements) {
          $('g').each(function () {
            var $elem = $(this);
            if (!$elem.children().length) {
              $elem.remove();
            }
          });
        }

        // Map to store references from id to uniqueId + id;
        var mappedIds = {};

        function getUniqueId (oldId) {
          return id + '-' + oldId;
        }

        if (options.setUniqueIds) {
          $('[id]').each(function () {
            var $elem = $(this);
            var id = $elem.attr('id');
            var uid = getUniqueId(id);

            mappedIds[id] = {
              id: uid,
              referenced: false,
              $elem: $elem
            };

            // If asked to remove elements with ID, otherwise, map unique id
            if (options.removeWithId && id === options.removeWithId) {
              $elem.remove();
            } else {
              $elem.attr('id', uid);
            }
          });
        }

        $('*').each(function () {
          var $elem = $(this);
          var attrs = $elem.attr();

          Object.keys(attrs).forEach(function (key) {
            var value = attrs[key];
            var id; var match; var isFillCurrentColor; var isStrokeCurrentColor; var preservedKey = '';

            while ((match = urlPattern.exec(value)) !== null) {
              id = match[1];
              if (mappedIds[id]) {
                mappedIds[id].referenced = true;
                $elem.attr(key, value.replace(match[0], 'url(#' + mappedIds[id].id + ')'));
              }
            }

            if (key === 'xlink:href') {
              id = value.substring(1);
              var idObj = mappedIds[id];
              if (idObj) {
                idObj.referenced = false;
                $elem.attr(key, '#' + idObj.id);
              }
            }

            // IDs are handled separately
            if (key !== 'id') {
              if (options.cleanupdefs || !$elem.parents('defs').length) {
                if (key.match(/preserve--/)) {
                  // Strip off the preserve--
                  preservedKey = key.substring(10);
                }

                if (cleanupAttributes.indexOf(key) > -1 || cleanupAttributes.indexOf(preservedKey) > -1) {
                  isFillCurrentColor = key === 'fill' && $elem.attr('fill') === 'currentColor';
                  isStrokeCurrentColor = key === 'stroke' && $elem.attr('stroke') === 'currentColor';

                  if (preservedKey && preservedKey.length) {
                    // Add the new key preserving value
                    $elem.attr(preservedKey, $elem.attr(key));

                    // Remove the old preserve--foo key
                    $elem.removeAttr(key);
                  } else if (!(isFillCurrentColor || isStrokeCurrentColor)) {
                    // Letting fill inherit the `currentColor` allows shared inline defs to
                    // be styled differently based on an SVG element's `color` so we leave these
                    $elem.removeAttr(key);
                  }
                } else {
                  if (preservedKey && preservedKey.length) {
                    // Add the new key preserving value
                    $elem.attr(preservedKey, $elem.attr(key));

                    // Remove the old preserve--foo key
                    $elem.removeAttr(key);
                  }
                }
              }
            }
          });
        });

        if (cleanupAttributes.indexOf('id') > -1) {
          Object.keys(mappedIds).forEach(function (id) {
            var idObj = mappedIds[id];
            if (!idObj.referenced) {
              idObj.$elem.removeAttr('id');
            }
          });
        }

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

        // If there is no title use the filename
        title = title || id;

        // Generate symbol
        var $res = cheerio.load('<symbol>' + $svg.html() + '</symbol>', { xmlMode: true });
        var $symbol = $res('symbol').first();

        // Merge in symbol attributes from option
        for (var attr in options.symbol) {
          $symbol.attr(attr, options.symbol[attr]);
        }

        // Add title and desc (if provided)
        if (desc && options.preserveDescElement) {
          $symbol.prepend('<desc>' + desc + '</desc>');
        }

        if (title && options.includeTitleElement) {
          $symbol.prepend('<title>' + title + '</title>');
        }

        // Add viewBox (if present on SVG w/ optional width/height fallback)
        var viewBox = $svg.attr('viewBox');

        // In case the user didn't use proper caps, but all lower-case.
        if (!viewBox && $svg.attr('viewbox')) {
          viewBox = $svg.attr('viewbox');
        }

        if (!viewBox && options.inheritviewbox) {
          var width = $svg.attr('width');
          var height = $svg.attr('height');
          var pxSize = /^\d+(\.\d+)?(px)?$/;
          if (pxSize.test(width) && pxSize.test(height)) {
            viewBox = '0 0 ' + parseFloat(width) + ' ' + parseFloat(height);
          }
        }

        if (viewBox) {
          $symbol.attr('viewBox', viewBox);
        }

        // Add ID to symbol
        var graphicId = options.prefix + id;
        $symbol.attr('id', graphicId);

        // Extract gradients and pattern
        var addToDefs = function () {
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
            name: graphicId,
            title: title,
            description: desc
          });
        }

        if (viewBox && !!options.fixedSizeVersion) {
          var fixedWidth = options.fixedSizeVersion.width || 50;
          var fixedHeight = options.fixedSizeVersion.width || 50;
          var $resFixed = cheerio.load('<symbol><use></use></symbol>', { lowerCaseAttributeNames: false });
          var fixedId = graphicId + (options.fixedSizeVersion.suffix || '-fixed-size');
          var $symbolFixed = $resFixed('symbol')
            .first()
            .attr('viewBox', [0, 0, fixedWidth, fixedHeight].join(' '))
            .attr('id', fixedId);
          Object.keys(options.symbol).forEach(function (key) {
            $symbolFixed.attr(key, options.symbol[key]);
          });
          if (desc) {
            $symbolFixed.prepend('<desc>' + desc + '</desc>');
          }
          if (title) {
            $symbolFixed.prepend('<title>' + title + '</title>');
          }
          var originalViewBox = viewBox
            .split(' ')
            .map(function (string) {
              return parseInt(string);
            });

          var translationX = ((fixedWidth - originalViewBox[2]) / 2) + originalViewBox[0];
          var translationY = ((fixedHeight - originalViewBox[3]) / 2) + originalViewBox[1];
          var scale = Math.max.apply(null, [originalViewBox[2], originalViewBox[3]]) /
            Math.max.apply(null, [fixedWidth, fixedHeight]);

          $symbolFixed
            .find('use')
            .attr('xlink:href', '#' + graphicId)
            .attr('transform', [
              'scale(' + parseFloat(scale.toFixed(options.fixedSizeVersion.maxDigits.scale || 4)).toPrecision() + ')',
              'translate(' + [
                parseFloat(translationX.toFixed(options.fixedSizeVersion.maxDigits.translation || 4)).toPrecision(),
                parseFloat(translationY.toFixed(options.fixedSizeVersion.maxDigits.translation || 4)).toPrecision()
              ].join(', ') + ')'
            ].join(' '));

          $resultSvg.append($resFixed.html());
          if (options.includedemo) {
            iconNameViewBoxArray.push({
              name: fixedId
            });
          }
        }
      });

      if (options.externalDefs) {
        var filepath = options.externalDefs;

        if (!grunt.file.exists(filepath)) {
          grunt.log.error('File "' + chalk.red(filepath) + '" not found.');
          return false;
        }

        var $file = cheerio.load(grunt.file.read(filepath), {
          xmlMode: true,
          normalizeWhitespace: true
        });

        var defs = $file('defs').html();

        if (defs === null) {
          grunt.log.warn('File "' + chalk.yellow(filepath) + '" contains no defs.');
        } else {
          $resultDefs.append(defs);
        }
      }

      // Remove defs block if empty
      if ($resultDefs.html().trim() === '') {
        $resultDefs.remove();
      }

      var result = options.formatting ? beautify($resultDocument.html(), options.formatting) : $resultDocument.html();
      var destName = path.basename(file.dest, '.svg');

      grunt.file.write(file.dest, result);

      grunt.log.writeln('File ' + chalk.cyan(file.dest) + ' created.');

      if (options.includedemo) {
        $resultSvg.attr('style', 'width:0;height:0;visibility:hidden;');

        var demoHTML;
        var viewData = {
          svg: $resultDocument.html(),
          icons: iconNameViewBoxArray
        };

        if (typeof options.includedemo === 'function') {
          demoHTML = options.includedemo(viewData);
        } else {
          var template = defaultTemplate;
          if (typeof options.includedemo === 'string') {
            template = options.includedemo;
          }
          demoHTML = handlebars.compile(template)(viewData);
        }

        var demoPath = path.resolve(path.dirname(file.dest), destName + '-demo.html');
        grunt.file.write(demoPath, demoHTML);
        grunt.log.writeln('Demo file ' + chalk.cyan(demoPath) + ' created.');
      }
    });
  });
};
