'use strict';

var grunt = require('grunt');

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

  with_include_demo : function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/includedemo-demo.html');
    var expected = grunt.file.read('test/expected/includedemo-demo.html');
    test.equal(actual, expected, 'should have created a valid demo html');

    test.done();
  },

  cutNameAfterFirstDot : function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/cutnameafterfirstdot.svg');
    var expected = grunt.file.read('test/expected/cutnameafterfirstdot.svg');
    test.equal(actual, expected, 'Name should be cut after the first dot');

    test.done();
  }
};
