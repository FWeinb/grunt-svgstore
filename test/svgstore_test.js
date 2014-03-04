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
    var expected = grunt.file.read('test/expected/default_options');
    test.equal(actual, expected, 'default options should work');

    test.done();
  },

  with_prefix: function(test){

    test.expect(1);

    var actual = grunt.file.read('tmp/prefix.svg');
    var expected = grunt.file.read('test/expected/prefix');
    test.equal(actual, expected, 'should add `prefix` to each id');

    test.done();
  },

  with_svg_attr: function(test){
    test.expect(1);

    var actual = grunt.file.read('tmp/svg_attr.svg');
    var expected = grunt.file.read('test/expected/svg_attr');
    test.equal(actual, expected, 'should add svg attributes');

    test.done();
  }
};
