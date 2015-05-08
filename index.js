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

        var fileContents = file.contents.toString();

        var currentClassWithApostrophes = fileContents.match(/Ext\.define[ |\n|\r|\(]*?[\'|\"][a-zA-Z0-9\.]*?[\'|\"]/);

        var requirements = fileContents.match(/requires[.|\n|\r| ]*:[ |\n|\r|]*\[[a-zA-Z0-9|\n|\r|\'|\"| |\.|,|\/]*\]/);
        var mixins = fileContents.match(/mixins[.|\n|\r]*:[ |\n|\r]*\{[a-zA-Z0-9|\n|\r|\'|\"| |\.|,|:]*\}/);
        var extend = fileContents.match(/extend[ |\n|\r]*:[ |\n|\r]*[\'|\"][a-zA-Z\.  ]*[\'|\"]/);
        var model = fileContents.match(/model[ |\n|\r]*:[ |\n|\r]*[\'|\"][a-zA-Z\.  ]*[\'|\"]/);

        //parse classnames
        var currentClass = getClassNames(currentClassWithApostrophes)[0];
        var reqClasses = getClassNames(requirements);
        var extendClasses = getClassNames(extend);
        var mixinClasses = getClassNames(mixins);
        var modelClass = getClassNames(model);

        var dependencyClasses = reqClasses.concat(extendClasses).concat(mixinClasses).concat(modelClass);

        tsort.add(currentClass, dependencyClasses);
        files[currentClass] = file;

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
};