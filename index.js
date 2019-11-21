'use strict';

var es = require('event-stream');
var TopoSort = require('topo-sort');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var strip = require('strip-comments');
//var fs = require('fs');

var PLUGIN_NAME = 'gulp-extify';

//debugging flags
var debug = {
    enabled : false,
    showContent : false
};

/**
 * this file just make sure that the test will work
 */
module.exports = function extify () {
    var files = {};
    var referencesFilesMap = {};
    var tsort = new TopoSort();

    var dependencies = {};
    var addedClasses = [];

    return es.through(function collectFilesToSort (file) {
        var defineRegexp = /Ext[\s|\n|\r]*\.define[\s|\n|\r]*\(/;

        if(debug.enabled) {
            console.log("Parsing file: " + file.relative + '\n' );

            if(debug.showContent) {
                console.log("Content: " + file.contents.toString() + '\n' );
            }
        }

        if(!file.contents) {
            return this.emit('error', new PluginError(PLUGIN_NAME, 'File: "' + file.relative + '" is empty. You have to read it with gulp.src(..)'));
        }

        var fileContent = '';
        try {
            fileContent = removeComments(file.contents.toString());
        } catch(e) {
            return this.emit('error', new PluginError(PLUGIN_NAME, 'There is error in js files found during removal of comments'));
        }

        if(debug.enabled && debug.showContent) {
            console.log("Content with no comments: " + fileContent + '\n' );
        }

        var startIndex = regexIndexOf(fileContent, defineRegexp);
        var stopIndex = regexIndexOf(fileContent, defineRegexp, startIndex+1);

        while(startIndex !== -1) {
            var defineContent, contentUntilStopIndex, contentUntilStopIndexCleared;
            if (stopIndex !== -1) {
                defineContent = fileContent.substr(startIndex, stopIndex-startIndex);
                contentUntilStopIndex = fileContent.substr(0, stopIndex);
                contentUntilStopIndexCleared = removeNotRequiredBracesFrom(contentUntilStopIndex);
            } else {
                defineContent = fileContent.substr(startIndex);
                contentUntilStopIndex = fileContent;
                contentUntilStopIndexCleared = removeNotRequiredBracesFrom(fileContent);
            }
            var braceDiffUntilStopIndex = Math.abs(countChars(contentUntilStopIndexCleared, '{') - countChars(contentUntilStopIndexCleared, '}'));

            //remove strings and regexp from content. They could be counted and cause brace count related bugs.
            var strClearedContent = removeNotRequiredBracesFrom(defineContent);
            var openBraces = countChars(strClearedContent, '{');
            var closedBraces = countChars(strClearedContent, '}');

            if(debug.enabled) {
                console.log("Counting braces: open braces = " + openBraces + ' closing braces: ' + closedBraces + '\n' );
            }

            if (openBraces === closedBraces) {

                if(debug.enabled) {
                    console.log('Open-close brace count is equal' + '\n');
                }

                var currentClassWithApostrophes = defineContent.match(/Ext[\s|\n|\r]*\.[\s|\n|\r]*define[\s|\n|\r|\(]*?[\'|\"][a-zA-Z0-9_\.]*?[\'|\"]/);

                var requirements = defineContent.match(/requires[.|\n|\r|\s]*:[\s|\n|\r|]*[\[]*[a-zA-Z0-9|\n|\r|\'|\"|\s|\.|,|_|\/]*[\]]*/);
                var mixins = defineContent.match(/mixins[.|\n|\r| ]*:[\s|\n|\r][\{|\[]+(.|\n|\r)*?(\}|\])+/);
                var extend = defineContent.match(/extend[\s|\n|\r]*:[\s|\n|\r]*[\'|\"][a-zA-Z0-9_\.\s]*[\'|\"]/);
                var model = defineContent.match(/model[\s|\n|\r]*:[\s|\n|\r]*[\'|\"][a-zA-Z0-9_\.\s]*[\'|\"]/);

                //parse classnames
                var currentClass = getClassNames(currentClassWithApostrophes)[0];
                var reqClasses = getClassNames(requirements);
                var extendClasses = getClassNames(extend);
                var mixinClasses = getClassNames(mixins);
                var modelClass = getClassNames(model);

                var dependencyClasses = mixinClasses.concat(extendClasses).concat(reqClasses).concat(modelClass);

                if(braceDiffUntilStopIndex === 0) {
                    dependencies[currentClass] = dependencyClasses;

                    if(debug.enabled) {
                        console.log('Adding class to dependencies: ' + currentClass + '\n');
                    }

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

    function removeNotRequiredBracesFrom(str) {
        var result = str.replace(/(''|""|'.*?[^\\']'|".*?[^\\]"|\/.*?[^\\]\/)/gm, '');
        return result;
    }

    function countChars(str, char) {
        var hist = {};
        for (var si in str) {
            hist[str[si]] = hist[str[si]] ? 1 + hist[str[si]] : 1;
        }
        return hist[char];
    }

    function getClassNames(stringWithClassNames) {
        var allClassNames = [];

        if(stringWithClassNames) {
            var i = 0;
            stringWithClassNames.forEach(function (req) {
                var classNames = req.match(/[\'|\"][a-zA-Z0-9\._]+[\'|\"]/g);
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
        //return content.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])?\/\/(?:.*)$)/gm, '');
        var result = strip(content);
        return result;
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
    }
};
