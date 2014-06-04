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

    // Matching an url() reference. To correct references broken by making ids unquie to the source svg
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
            includedemo: false
        });

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
                var uniqueId = md5(contentStr);
                var $ = cheerio.load(contentStr, {
                        normalizeWhitespace: true,
                        xmlMode: true
                    });

                // Map to store references from id to uniqueId + id;
                var mappedIds = {};

                // Make IDs unique
                $('[id]').each(function () {
                    var $elem = $(this);
                    var id = $elem.attr('id');
                    var newId = uniqueId + id;
                    mappedIds[id] = newId;
                    $elem.attr('id', newId);
                });

                // Search for an url() reference in every attribute of every tag
                // replace the id with the unique one.
                $('*').each(function () {
                    var $elem = $(this);
                    var attrs = $elem.attr();
                    Object.keys(attrs).forEach(function (key) {
                        var value = attrs[key];
                        var match;
                        while ((match = urlPattern.exec(value)) !== null) {
                            if (mappedIds[match[1]] !== undefined) {
                                value = value.replace(match[0], 'url(#' + mappedIds[match[1]] + ')');
                            } else {
                                grunt.log.warn('Can\'t reference to id "' + match[1] + '" from attribute "' + attr + '" in "' + this[0].name + '" because it is not defined.');
                            }
                        }
                        $elem.attr(key, value);
                    });
                });

                var $svg = $('svg');
                var $title = $('title');
                var $desc = $('desc');
                var $def = $('defs').first();

                // merge in the defs from this svg in the result defs block.
                $resultDefs.append($def.html());

                var title = $title.first().html();
                var desc = $desc.first().html();

                // remove def, title, desc from this svg
                $def.remove();
                $title.remove();
                $desc.remove();

                // If there is no title use the filename
                title = title || filename;

                var resultStr = '<symbol>' + '<title>' + title + '</title>';

                // Only add desc if it was set
                if ( desc ) {  resultStr +='<desc>'+ desc +'</desc>';  }

                resultStr += $svg.html() + '</symbol>';

                // Create a object
                var $res = cheerio.load(resultStr, { lowerCaseAttributeNames : false });

                $res('symbol').attr('viewBox', $svg.attr('viewBox'));

                var graphicId = options.prefix + filename;
                // Add ID to the first Element
                $res('*').first().attr('id', graphicId);

                // Append <symbol> to resulting SVG
                $resultSvg.append($res.html());


                // Add icon to the demo.html array
                if (options.includedemo) {
                    iconNameViewBoxArray.push({
                        name: graphicId
                    });
                }

            });

            // remove defs block if empty
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