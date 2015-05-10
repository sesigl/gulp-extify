'use strict';

var es = require('event-stream');
var TopoSort = require('topo-sort');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

var PLUGIN_NAME = 'gulp-extify';

/**
 * this file just make sure that the test will work
 */
module.exports = function extify () {
    var files = {};
    var classAnalytics = [];
    var tsort = new TopoSort();

    return es.through(function collectFilesToSort (file) {
        if(!file.contents) {
            return this.emit('error', new PluginError(PLUGIN_NAME, 'File: "' + file.relative + '" is empty. You have to read it with gulp.src(..)'));
        }

        var fileContent = removeComments(file.contents.toString());

        var startIndex = regexIndexOf(fileContent, /Ext[ |\n|\r]*\.define[ |\n|\r]*\(/);
        var stopIndex = regexIndexOf(fileContent, /Ext[ |\n|\r]*\.define[ |\n|\r]*\(/, startIndex+1);

        while(startIndex !== -1) {
            if(stopIndex !== -1) {
                var defineContent = fileContent.substr(startIndex, stopIndex);
            } else {
                var defineContent = fileContent.substr(startIndex);
            }
            var currentClassWithApostrophes = defineContent.match(/Ext\.define[ |\n|\r|\(]*?[\'|\"][a-zA-Z0-9\.]*?[\'|\"]/);

            var requirements = defineContent.match(/requires[.|\n|\r| ]*:[ |\n|\r|]*\[[a-zA-Z0-9|\n|\r|\'|\"| |\.|,|\/]*\]/);
            var mixins = defineContent.match(/mixins[.|\n|\r| ]*:[ |\n|\r]\{(.|\n|\r)*?\}/);
            var extend = defineContent.match(/extend[ |\n|\r]*:[ |\n|\r]*[\'|\"][a-zA-Z\. ]*[\'|\"]/);
            var model = defineContent.match(/model[ |\n|\r]*:[ |\n|\r]*[\'|\"][a-zA-Z\. ]*[\'|\"]/);

            //parse classnames
            var currentClass = getClassNames(currentClassWithApostrophes)[0];
            var reqClasses = getClassNames(requirements);
            var extendClasses = getClassNames(extend);
            var mixinClasses = getClassNames(mixins);
            var modelClass = getClassNames(model);

            var dependencyClasses = mixinClasses.concat(extendClasses).concat(reqClasses).concat(modelClass);

            tsort.add(currentClass, dependencyClasses);
            files[currentClass] = file;

            startIndex = regexIndexOf(fileContent, /Ext[ |\n|\r]*\.define[ |\n|\r]*\(/, startIndex+1);
            stopIndex = regexIndexOf(fileContent, /Ext[ |\n|\r]*\.define[ |\n|\r]*\(/, startIndex+1);
        }
    }, function afterFileCollection () {

        try {
            var result = tsort.sort().reverse();
        } catch(e) {
            return this.emit('error', new PluginError(PLUGIN_NAME, e.message));
        }

        result.forEach(function (className) {
            if(files[className]) {
                this.emit('data', files[className]);
            }
        }.bind(this));

        this.emit('end');
    });

    function getClassNames(stringWithClassNames) {
        var allClassNames = [];

        if(stringWithClassNames) {
            var i = 0;
            stringWithClassNames.forEach(function (req) {
                var classNames = req.match(/[\'|\"][a-zA-Z0-9\.]+[\'|\"]/g);
                if(classNames) {
                    classNames.forEach(function (c, index) {
                        if (typeof index === "number") {
                            allClassNames[i++] = c.substr(1, c.length - 2);
                        }
                    });
                }
            });
        }

        return allClassNames;
    }

    function removeComments(content) {
        return content.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm, '');
    }

    function regexIndexOf (str, regex, startpos) {
        var indexOf = str.substring(startpos || 0).search(regex);
        return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
    }
};