'use strict';

/**
 * this file just make sure that the test will work
 */

var through = require('through2');

var gulpExtDependencies = function(startFile) {
    return [startFile];
}

module.exports = gulpExtDependencies;