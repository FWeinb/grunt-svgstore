# Release History

## 2.0.0 (November 30, 2018)

- Support Grunt 1+ and Node 6+
- Use eslint
- Added the `setUniqueIds` and `removeEmptyGroupElements` options for ability
  to choose whether or not to set unique ids and remove empty elements
- Automatically fix `viewbox` as well as `viewBox` on source items
- Added the `allowDuplicateItems` option to allow duplicate item names
- Make `<desc>` available in custom templates

## 1.0.0 (February 2, 2016)

- Added: Preserving of strokes (in addition to fills).
- Added: CHANGELOG.md to document changes between releases.
- Updated: Preserving of fills.
- Updated: dependencies.

## 0.5.0

- Added the `includeTitleElement`  and `preserveDescElement` options for more
  control of the accessible names for icons
  (See [#83](https://github.com/FWeinb/grunt-svgstore/pull/83))
- Added the `externalDefs` option to include a custom set of shared `<defs>`
  (like gradients) across multiple svgs.
  (See [#81](https://github.com/FWeinb/grunt-svgstore/pull/81))

## 0.4.1
  
- Introducing the `preserve--` prefix for attributes to force these attributes
  in the result svg
  (See [#71](https://github.com/FWeinb/grunt-svgstore/pull/71))

## 0.4.0

- Generate fixed sized reference based copies of symbols
  (See [#58](https://github.com/FWeinb/grunt-svgstore/pull/58))
- Add a way to inherit the viewbox form the source svg
  (See [#66](https://github.com/FWeinb/grunt-svgstore/pull/66))
- Expose `convertNameToId` option to customize how ids are derived from file
  names. (See [#68](https://github.com/FWeinb/grunt-svgstore/pull/68))
- Changed the way ids are generated by using the result of `convertNameToId` to
  prefix each id.
  (See [#50](https://github.com/FWeinb/grunt-svgstore/issues/50))

## 0.3.6

- Preserve currentColor in `fill` attribute even if `cleanup` is set to `true`.
  (See [#63](https://github.com/FWeinb/grunt-svgstore/pull/63)) 

## 0.3.5

- Add the ability to use [`handlebars`](http://handlebarsjs.com/) templates in
  `options.includedemo`.

## 0.3.4

- Fixed an issue with SMIL animations inside a svg symbole
  (See [#56](https://github.com/FWeinb/grunt-svgstore/issues/56))
- Update to cheerio `0.17.0`

## 0.3.3

- Fix broken id references between nested `<symbol>` tags.
  (See [#50](https://github.com/FWeinb/grunt-svgstore/issues/50#issuecomment-52271449))

## 0.3.2 
  
- Move `linearGradient`, `radialGradient` and `pattern` elements out of the
  `<symbol>` tag.
  (See [#49](https://github.com/FWeinb/grunt-svgstore/issues/49))

## 0.3.1

- Fix removal of unreferenced IDs
  (See [#46](https://github.com/FWeinb/grunt-svgstore/issues/46))

## 0.3.0

- Changed the way ID are collected; <del>unreferenced IDs are removed now in
  order to save space.</del>
  ([#40](https://github.com/FWeinb/grunt-svgstore/pull/40))
- Changed the behavior of the 'cleanup'-option (introduced in 0.2.6). Apart
  from true / false, the value of this property can now be an array of
  attributes. All attributes in the array are removed from all elements in the
  SVG. ([#41](https://github.com/FWeinb/grunt-svgstore/pull/41))
- Added an option 'cleanupdefs' (default: false). When set to false, no cleanup
  is performed on the `<defs>` element.
  ([#41](https://github.com/FWeinb/grunt-svgstore/pull/41))
- Empty `<g>` elements are removed since they have no effect in a document.
  ([#42](https://github.com/FWeinb/grunt-svgstore/pull/42))
  
Thanks to [Frank3K](https://github.com/Frank3K) for the PRs

## 0.2.7

- Don't generate IDs that start with a number by prefixing them with
  `svgstore`.
  (Thanks to [#38](https://github.com/FWeinb/grunt-svgstore/pull/38))

## 0.2.6

- Add `options.clean` to remove inline styles from source svgs.
  (Thanks to [ain](https://github.com/FWeinb/grunt-svgstore/pull/37))
- Reformat source to use 2 spaces for indentation
  (Fix [#36](https://github.com/FWeinb/grunt-svgstore/issues/36))

## 0.2.5

- To generate the id from the filename is now used as a title.
  (Fix [#33](https://github.com/FWeinb/grunt-svgstore/issues/33))

## 0.2.4

- Added `options.symbol` to add attributes to generated `<symbol>`s
  ([#30](https://github.com/FWeinb/grunt-svgstore/pull/30))
- To generate the id from the filename the name is now cut right before the
  first dot. `name.min.svg` becomes `name`.
  (Fixes [#29](https://github.com/FWeinb/grunt-svgstore/issues/29))

## 0.2.3

- Fixed lower case `viewBox` in outputted svg
  (fix [#26](https://github.com/FWeinb/grunt-svgstore/issues/26))

## 0.2.2

- Fixed a bug where self-closing elements where nested.

## 0.2.1

- Move `<symbol>`-tag out of `<defs>`-tag
  (see the [spec](http://www.w3.org/TR/SVG11/struct.html#SymbolElement))
- Only create `<defs>`-tag if needed (e.g.  `<linearGradient>` is used)

## 0.2.0

- Use a `<symbol>`-tag for representing icons (See [TxHawks Comment](https://github.com/FWeinb/grunt-svgstore/issues/16#issuecomment-43786059).)
- Write the `viewBox` attribute to the `<symbol>`-tag,
- Include `title` and `desc` elements in the generated svg for each `<symbol>`
- use 'filename' as a fallback for `title`
- Fix issue [#1](https://github.com/FWeinb/grunt-svgstore/issues/1)

## 0.1.0

- Always add `xmlns` namspace.
- Added the `includedemo` option.
- Fixed Issues [#20](https://github.com/FWeinb/grunt-svgstore/issues/20),
  [#19](https://github.com/FWeinb/grunt-svgstore/issues/19),
  [#18](https://github.com/FWeinb/grunt-svgstore/issues/18)

## 0.0.4

- Fixed issue with referencing ids with `url()`
  (fix [#12](https://github.com/FWeinb/grunt-svgstore/issues/12))

## 0.0.3

- Added `options.formatting` to format svg via
  [js-beautify](https://github.com/einars/js-beautify)

## 0.0.2

- Fixed npm dependencies

## 0.0.1

- Inital release
