# grunt-svgstore [![NPM version](https://badge.fury.io/js/grunt-svgstore.svg)](http://badge.fury.io/js/grunt-svgstore) [![Build Status](https://travis-ci.org/FWeinb/grunt-svgstore.svg?branch=master)](https://travis-ci.org/FWeinb/grunt-svgstore)

> Merge SVGs from a folder.

## Want to help? 

I am looking for a maintainer who would like to take over this plugin. 

## Why?

Because [Chris Coyier](http://shoptalkshow.com/episodes/103-louis-lazaris/#t=33:52) asked.

## Getting Started

This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-svgstore --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-svgstore');
```

## Screencast 

Chris made a screencast, using `grunt-svgstore` in a real project, you can find it [here](http://css-tricks.com/video-screencasts/screencast-134-tour-site-progress-built-jekyll-grunt-sass-svg-system/).


## The "svgstore" task

### Overview

In your project's Gruntfile, add a section named `svgstore` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  svgstore: {
    options: {
      prefix : 'icon-', // This will prefix each ID
      svg: { // will add and overide the the default xmlns="http://www.w3.org/2000/svg" attribute to the resulting SVG
        viewBox : '0 0 100 100',
        xmlns: 'http://www.w3.org/2000/svg'
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

#### options.symbol (since 0.2.4)

Type: `Object`  
Default value: `{}`  

Just like `options.svg` but will add attributes to each generated `<symbol>`.

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

#### options.includedemo (since 0.3.5)

Type: `boolean|string|function`  
Default value: `false`

This will include a demo HTML (named like `destName + -demo.html`) from where you can copy your `<use>` blocks.

The default template used looks like:

```html
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
    {{{svg}}}

    {{#each icons}}
        <svg>
          <use xlink:href="#{{name}}" />
        </svg>
    {{/each}}

  </body>
</html>
```

Since `0.3.5` you can customise this by passing in a `string` that will be compiled via `handlebars` and used as a tempalte. If it is a function this function is expected to take one parameter and return a string. 

The data passed to the template looks like this:
```js
{
  svg : '[raw HTML of the generated svg]',
  icons : [
    name : 'name of an item',
    title : 'extracted title or name'
  ]
}
```

#### options.cleanup (since 0.2.6)

Type: `boolean`  or `Array`
Default value: `false`  

This option can be used to clean up inline definitions that may jeopardise later CSS-based styles.  
When set to true clean up all inline `style` attributes.  
Apart from true / false, the value of this property can be an array of inline attributes ( like `fill`, `stroke`, ...) you want to remove from the elements in the SVG.

#### options.cleanupdefs (since 0.3.0)

Type: `boolean`  
Default value: `false`  

When set to false, no cleanup is performed on the `<defs>` element.

#### options.inheritviewbox (since 0.4.0)

Type: `boolean`  
Default value: `false`

By default, each generated `<symbol>` will only automatically have a `viewBox`
attribute set if the original source SVG file for that symbol has a `viewBox`.

When `inheritviewbox` is set to `true`, if the source SVG has no `viewBox` but
it *does* have a pixel-based `width` and `height`, then the `<symbol>`
`viewBox` will be derived using those values instead.

For example, with `inheritviewbox: true`,

```svg
<svg width="256" height="128">
```

will result in:

```svg
<symbol viewBox="0 0 256 128" ...>
```

#### options.convertNameToId (since 0.4.0)

Type: `function`

The function used to generate the ID from the file name. The function receives the file name without the `.svg` extension as its only argument.

The default implementation:
```js
function(name) {
  var dotPos = name.indexOf('.');
  if ( dotPos > -1){
    name = name.substring(0, dotPos);
  }
  return name;
}
```

#### options.fixedSizeVersion (Since 0.4.0)

Type: `Object` or `boolean`
Default value: `false`

When `true` or a configuration object is passed for each of the symbols another one, with suffixed id generated.
All those additional symbols have the common dimensions and refers to the original symbols with `<use>`.
Original symbols are placed exactly in the middle of the fixed-size viewBox of the fixed size version.

Configuration reference and default values if `true` is passed:
```js
grunt.initConfig({
  svgstore: {
    options: {
      fixedSizeVersion: {
        width: 50,
        height: 50,
        suffix: '-fixed-size',
        maxDigits: {
          translation: 4,
          scale: 4,
        },
      },
    },
  },
});
```

Any of the configuration object properties may be omitted.

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

#### options.includeTitleElement (since 0.5.0)

Type: `Boolean`
Default value: `true`

Include a `<title>` element for screen readers. Uses the filename if no `<title>` was found on the source SVG. Set to `false` only if you are providing your own accessible name in your code.

#### options.preserveDescElement (since 0.5.0)

Type: `Boolean`
Default value: `true`

Preserve `<desc>` element for screen readers if present. Set to `false` to suppress.

#### options.removeWithId

Type: `String`
Default value: `null`

Use this option to provide an ID of an SVG element you'd like removed. Likely use case is a bounding box path. Simply add `id='remove-me'` and then supply `removeWithId: 'remove-me'` in the options.

## Supplemental Features

There are some hidden features available in grunt-svgstore:

  * Use the `preserve--` prefix (in the source SVG), for any attributes that should be forced to remain in the resulting SVG. For example, `preserve--stroke` would result in just `stroke` in the resulting SVG. This happens whether or not you ask for that attribute to be *cleaned* via `cleanup`.
  * Using the value of `currentColor` on any property with the key `fill`, will result in that property remaining in the resulting SVG (regardless of whether or not you ask for `fill` to be *cleaned* via `cleanup`). This can be used to achieve *accent color* for you SVG instances by defining the font color on a parent element via the CSS `color` property.

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).
