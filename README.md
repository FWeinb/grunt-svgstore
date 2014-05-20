# grunt-svgstore [![NPM version](https://badge.fury.io/js/grunt-svgstore.svg)](http://badge.fury.io/js/grunt-svgstore) [![Build Status](https://travis-ci.org/FWeinb/grunt-svgstore.svg?branch=master)](https://travis-ci.org/FWeinb/grunt-svgstore)

> Merge SVGs from a folder.

## Why?
Because [Chris Coyer](http://shoptalkshow.com/episodes/103-louis-lazaris/#t=33:52) asked.

## Getting Started
This plugin requires Grunt `~0.4.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-svgstore --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-svgstore');
```

## The "svgstore" task

### Overview
In your project's Gruntfile, add a section named `svgstore` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  svgstore: {
    options: {
      prefix : 'icon-', // This will prefix each ID
      svg: { // will be added as attributes to the resulting SVG
        viewBox : '0 0 100 100'
      }
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.prefix
Type: `String`
Default value: `''`

A string value that is used to prefix each filename to generate the id.

#### options.svg
Type: `Object`
Default value: `{}`

An object that is used to generate attributes for the resulting `svg` file.
```js
{
  viewBox: '0 0 100 100'
}
```
will result in:

```svg
<svg viewBox="0 0 100 100">
[...]
```

#### options.formatting (since 0.0.4)
Type: `Object` or `boolean`
Default value: `false`

Formatting options for generated code.

To format the generated HTML, set `formatting` with [options](https://github.com/einars/js-beautify#options) like: `{indent_size : 2}`, which in context looks like:

```js
default: {
  options: {
    formatting : {
      indent_size : 2
    }
  }
```
See [js-beautify](https://github.com/einars/js-beautify) for more options.

#### options.includedemo (since 0.1.0)
Type: `boolean`
Default value: `false`

This will include a demo HTML (named like `destName + -demo.html`) from where you can copy your `<use>` blocks.

### Usage Examples

This example will merge all elements from the `svgs` folder into the `<defs>`-Block of the `dest.svg`. You can use that SVG in HTML like:

```html
<!-- Include dest.svg -->

[...]

<svg><use xlink:href="#filename" /></svg>
````

```js
grunt.initConfig({
  svgstore: {
    options: {},
    default : {
      files: {
        'dest/dest.svg': ['svgs/*.svg'],
      },
    },
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
  * 0.1.0 Always add `xmlns` namspace. Added the `includedemo` option. Fixed Issues [#20](https://github.com/FWeinb/grunt-svgstore/issues/20), [#19](https://github.com/FWeinb/grunt-svgstore/issues/19), [#18](https://github.com/FWeinb/grunt-svgstore/issues/18)
  * 0.0.4 Fixed issue with referencing ids with `url()` (fix [#12](https://github.com/FWeinb/grunt-svgstore/issues/12))
  * 0.0.3 Added `options.formatting` to format svg via [js-beautify](https://github.com/einars/js-beautify)
  * 0.0.2 Fixed npm dependencies
  * 0.0.1 Inital release
