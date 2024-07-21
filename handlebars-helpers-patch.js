"use strict";
// node_modules/handlebars-helpers/lib/utils/utils.js

// Array utils
// utils('array-sort', 'sortBy');
// utils('arr-flatten', 'flatten');
//
// // Html utils
// utils('to-gfm-code-block', 'block');
// utils('html-tag', 'tag');
//
// // JavaScript language utils
// utils('kind-of', 'typeOf');
//
// // matching utils
// utils('is-glob');
// utils('micromatch', 'mm');
// utils('falsey');
//
// // Number utils
// utils('is-even');
// utils('is-number');
//
// // Object utils
// utils('create-frame');
// utils('get-object');
// utils('get-value', 'get');
// utils('for-own');
//
// // Path utils
// utils('relative');

/**
 * Expose `utils`
 */

module.exports = {
  sortBy: require("array-sort"),
  flatten: require("arr-flatten"),
  // block: require('to-gfm-code-block'),
  // tag: require('html-tag'),
  // typeOf: require('kind-of'),
  // mm: require('micromatch'),
  // falsey: require('falsey'),
  isNumber: require("is-number"),
  isEven: require("is-even"),
  // get: require('get-value'),
  // createFrame: require('create-frame'),
  // get: require('get-value'),
  // forOwn: require('for-own'),
  // relative: require('relative'),
};
