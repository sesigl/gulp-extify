'use strict';

var es = require('event-stream');
var TopoSort = require('topo-sort');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
//var fs = require('fs');

var PLUGIN_NAME = 'gulp-extify';

/**
 * this file just make sure that the test will work
 */
module.exports = function extify () {
    var files = {};
    var referencesFilesMap = {};
    var classAnalytics = [];
    var tsort = new TopoSort();

    var dependencies = {};
    var addedClasses = new Array();

    return es.through(function collectFilesToSort (file) {
        var defineRegexp = /Ext[ |\n|\r]*\.define[ |\n|\r]*\(/;

        if(!file.contents) {
            return this.emit('error', new PluginError(PLUGIN_NAME, 'File: "' + file.relative + '" is empty. You have to read it with gulp.src(..)'));
        }

        var fileContent = removeComments(file.contents.toString());

        var startIndex = regexIndexOf(fileContent, defineRegexp);
        var stopIndex = regexIndexOf(fileContent, defineRegexp, startIndex+1);

        while(startIndex !== -1) {
            if (stopIndex !== -1) {
                var defineContent = fileContent.substr(startIndex, stopIndex-startIndex);
                var contentUntilStopIndex = fileContent.substr(0, stopIndex);
            } else {
                var defineContent = fileContent.substr(startIndex);
                var contentUntilStopIndex = fileContent;
            }
            var braceDiffUntilStopIndex = Math.abs(countChars(contentUntilStopIndex, '{') - countChars(contentUntilStopIndex, '}'));
            var openBraces = countChars(defineContent, '{');
            var closedBraces = countChars(defineContent, '}');

            if (openBraces === closedBraces) {

                var currentClassWithApostrophes = defineContent.match(/Ext[ |\n|\r]*\.[ |\n|\r]*define[ |\n|\r|\(]*?[\'|\"][a-zA-Z0-9\.]*?[\'|\"]/);

                var requirements = defineContent.match(/requires[.|\n|\r| ]*:[ |\n|\r|]*[\[]*[a-zA-Z0-9|\n|\r|\'|\"| |\.|,|\/]*[\]]*/);
                var mixins = defineContent.match(/mixins[.|\n|\r| ]*:[ |\n|\r][\{|\[]+(.|\n|\r)*?(\}|\])+/);
                var extend = defineContent.match(/extend[ |\n|\r]*:[ |\n|\r]*[\'|\"][a-zA-Z\. ]*[\'|\"]/);
                var model = defineContent.match(/model[ |\n|\r]*:[ |\n|\r]*[\'|\"][a-zA-Z\. ]*[\'|\"]/);

                //parse classnames
                var currentClass = getClassNames(currentClassWithApostrophes)[0];
                var reqClasses = getClassNames(requirements);
                var extendClasses = getClassNames(extend);
                var mixinClasses = getClassNames(mixins);
                var modelClass = getClassNames(model);


                var dependencyClasses = mixinClasses.concat(extendClasses).concat(reqClasses).concat(modelClass);

                if(braceDiffUntilStopIndex === 0) {
                    dependencies[currentClass] = dependencyClasses;
                    files[currentClass] = file;

                    //put all file paths in a map, and update all concat all dependencies
                    if(!referencesFilesMap[file.path]) {
                        referencesFilesMap[file.path] = [currentClass];
                    } else {
                        referencesFilesMap[file.path].forEach(function(refClassName) {
                            dependencies[refClassName] = concatUnique(dependencies[refClassName], dependencies[currentClass]);
                            dependencies[currentClass] = concatUnique(dependencies[currentClass], dependencies[currentClass]);
                        });
                    }
                }

                if(stopIndex !== -1) {
                    startIndex = regexIndexOf(fileContent, defineRegexp, stopIndex + 1);
                } else {
                    startIndex = regexIndexOf(fileContent, defineRegexp, startIndex + 1);
                }

                stopIndex = regexIndexOf(fileContent, defineRegexp, startIndex + 1);
            } else {
                if(stopIndex !== -1) {
                    stopIndex = regexIndexOf(fileContent, defineRegexp, stopIndex + 1);
                } else {
                    startIndex = regexIndexOf(fileContent, defineRegexp, startIndex + 1);
                }
            }
        }
    }, function afterFileCollection () {

        dependencies = sortObjectByKey(dependencies);
        for( var className in dependencies) {
            if(className != "undefined") {
                tsort.add(className, dependencies[className]);
            }
        }

        //fs.writeFile('tsort.map.txt', JSON.stringify(tsort.map));

        try {
            var result = tsort.sort().reverse();
        } catch(e) {
            return this.emit('error', new PluginError(PLUGIN_NAME, e.message));
        }

        //fs.writeFile('tsort.result.txt', JSON.stringify(result));

        result.forEach(function (className) {
            if(files[className] && addedClasses.indexOf(files[className]) === -1) {
                addedClasses.push(files[className]);
                this.emit('data', files[className]);
            }
        }.bind(this));

        this.emit('end');
    });

    function countChars(str, char) {
        var hist = {};
        for (var si in str) {
            hist[str[si]] = hist[str[si]] ? 1 + hist[str[si]] : 1;
        };
        return hist[char];
    }

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

    function concatUnique(arr1, arr2) {
        arr2.forEach(function(element) {
            if(arr1.indexOf(element) === -1) {
                arr1.push(element);
            }
        });
        return arr1;
    }

    //noinspection Eslint
    function removeComments(content) {
        return content.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm, '');
    }

    function regexIndexOf (str, regex, startpos) {
        var indexOf = str.substring(startpos || 0).search(regex);
        return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
    }

    function sortObjectByKey (obj){
        var keys = [];
        var sorted_obj = {};

        for(var key in obj){
            if(obj.hasOwnProperty(key)){
                keys.push(key);
            }
        }

        // sort keys
        keys.sort();

        // create new array based on Sorted Keys
        keys.forEach(function(key) {
            sorted_obj[key] = obj[key];
        });

        return sorted_obj;
    };
};