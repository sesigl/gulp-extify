var assert = require("assert");
var extDependencies = require("../main.js"); // node.js core module
var gulp = require('gulp');

describe('gulp-extjs-dependencies', function(){
    it("should pipe simple file names", function () {
        assert.ok(extDependencies({}));
    });
});