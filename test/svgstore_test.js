'use strict';

var grunt = require('grunt');
var minify = require('html-minifier').minify;

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.svgstore = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  default_options: function(test) {

    test.expect(1);

    var actual = grunt.file.read('tmp/default_options.svg');
    var expected = grunt.file.read('test/expected/default_options.svg');
    test.equal(actual, expected, 'default options should work');

    test.done();
  },

  with_prefix: function(test){

    test.expect(1);

    var actual = grunt.file.read('tmp/prefix.svg');
    var expected = grunt.file.read('test/expected/prefix.svg');
    test.equal(actual, expected, 'should add `prefix` to each id');

    test.done();
  },

  with_svg_attr: function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/svg_attr.svg');
    var expected = grunt.file.read('test/expected/svg_attr.svg');
    test.equal(actual, expected, 'should add svg attributes');

    test.done();
  },

  with_symbol_attr: function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/symbol_attr.svg');
    var expected = grunt.file.read('test/expected/symbol_attr.svg');
    test.equal(actual, expected, 'should add attributes in every merged svg-object (currently symbol-tag)');

     test.done();
  },


  with_formatting: function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/formatting.svg');
    var expected = grunt.file.read('test/expected/formatting.svg');
    test.equal(actual, expected, 'should add formatting');

    test.done();
  },

  with_url_ref: function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/withurlref.svg');
    var expected = grunt.file.read('test/expected/withurlref.svg');
    test.equal(actual, expected, 'should keep links between id and url() intact');

    test.done();
  },

  nested_symbol_ref: function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/nestedsymbol.svg');
    var expected = grunt.file.read('test/expected/nestedsymbol.svg');
    test.equal(actual, expected, 'should keep links between id and url() intact');

    test.done();
  },

  withCleanup: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/cleanup.svg');
    var expected = grunt.file.read('test/expected/cleanup.svg');
    test.equal(actual, expected, 'All path inline style attributes should be removed');

    test.done();
  },

  with_include_demo : function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/includedemo-demo.html');
    var expected = grunt.file.read('test/expected/includedemo-demo.html');

    // This way the comparison stays immune to whitespace changes.
    var minificationOptions = {
      collapseWhitespace: true,
      minifyCSS: true
    };

    test.equal(
        minify(actual, minificationOptions),
        minify(expected, minificationOptions),
        'should have created a valid demo html'
    );
    test.done();
  },

  cutNameAfterFirstDot : function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/cutnameafterfirstdot.svg');
    var expected = grunt.file.read('test/expected/cutnameafterfirstdot.svg');
    test.equal(actual, expected, 'Name should be cut after the first dot');

    test.done();
  },

  remove_unreferenced_ids: function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/no_unref_ids.svg');
    var expected = grunt.file.read('test/expected/no_unref_ids.svg');
    test.equal(actual, expected, 'Remove unreferenced IDs');

    test.done();
  },

  with_cleanup_fill: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/cleanup_fill.svg');
    var expected = grunt.file.read('test/expected/cleanup_fill.svg');
    test.equal(actual, expected, 'All fill attributes should be removed');

    test.done();
  },

  cleanup_fill_leaves_current_color_fills: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/cleanup_with_currentColor.svg');
    var expected = grunt.file.read('test/expected/cleanup_with_currentColor.svg');
    test.equal(actual, expected, 'fill with value of currentColor should NOT be removed');

    test.done();
  },

  cleanup_preserve_leaves_attributes: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/preserve_attribute.svg');
    var expected = grunt.file.read('test/expected/preserve_attribute.svg');
    test.equal(actual, expected, 'attribute with value of preserve-- should strip preserve');

    test.done();
  },

  cleanup_with_inheritviewbox: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/cleanup_with_inheritviewbox.svg');
    var expected = grunt.file.read('test/expected/cleanup_with_inheritviewbox.svg');
    test.equal(actual, expected, 'viewBox may use width/height of SVG if inheritviewbox enabled');

    test.done();
  },

  with_cleanupdefs: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/defs_clean.svg');
    var expected = grunt.file.read('test/expected/defs_clean.svg');
    test.equal(actual, expected, 'All style attributes inside <defs> should be removed');

    test.done();
  },

  without_cleanupdefs: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/defs_noclean.svg');
    var expected = grunt.file.read('test/expected/defs_noclean.svg');
    test.equal(actual, expected, 'All style attributes inside <defs> should be removed');

    test.done();
  },

  remove_emptyg: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/no_empty_g.svg');
    var expected = grunt.file.read('test/expected/no_empty_g.svg');
    test.equal(actual, expected, 'All empty g elements should be removed');

    test.done();
  },

  perserveAnimation: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/anim.svg');
    var expected = grunt.file.read('test/expected/anim.svg');
    test.equal(actual, expected, 'Animations should be intact');

    test.done();
  },

  customTemplate: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/customTemplate-demo.html');
    var expected = grunt.file.read('test/expected/customTemplate-demo.html');

    // This way the comparison stays immune to whitespace changes.
    var minificationOptions = {
      collapseWhitespace: true,
      minifyCSS: true
    };

    test.equal(
        minify(actual, minificationOptions),
        minify(expected, minificationOptions),
        'should have created a valid demo html'
    );
    test.done();
  },

  customTemplateFunction: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/customTemplateFunction-demo.html');
    var expected = grunt.file.read('test/expected/customTemplateFunction-demo.html');

    // This way the comparison stays immune to whitespace changes.
    var minificationOptions = {
      collapseWhitespace: true,
      minifyCSS: true
    };

    test.equal(
        minify(actual, minificationOptions),
        minify(expected, minificationOptions),
        'should have created a valid demo html'
    );
    test.done();
  },

  customIdFunction: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/customIdFunction.svg');
    var expected = grunt.file.read('test/expected/customIdFunction.svg');

    test.equal(actual, expected, 'Symbol ID should not contain prefix');
    test.done();
  }

};
