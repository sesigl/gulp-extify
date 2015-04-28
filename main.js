'use strict';

var through = require('through2');

/**
 * this file just make sure that the test will work
 */
var gulpExtDependencies = function(options) {
    return through.obj(function(file, enc, callback) {
        if (!('contents' in file)) {
            this.push(file);
            return callback();
        } else if (file.isNull()) {
            this.push(file);
            return callback();
        } else if (file.isStream()) {
            throw new gutil.PluginError('gulp-regex-replace', 'streams not implemented');
        } else if (file.isBuffer()) {
            var contents = String(file.contents);

            file.contents = new Buffer(contents);
        }

        this.push(file);
        return callback();
    });
}

module.exports = gulpExtDependencies;