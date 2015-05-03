var chai = require('chai'),
    should = chai.should(),
    extify = require("./../"),
    gutil = require('gulp-util'),
    path = require('path'),
    fs = require('fs'),
    gulp = require('gulp');

function fixture(file, config) {
    var filepath = path.join(__dirname, file);
    return new gutil.File({
        path: filepath,
        cwd: __dirname,
        base: __dirname,
        contents: config && config.withoutContents ? undefined : fs.readFileSync(filepath)
    });
}

function sort(files, checkResults) {
    var resultFiles = [];

    var stream = extify();

    stream.on('data', function (file) {
        resultFiles.push(file.relative);
    });

    stream.on('end', function () {
        checkResults(resultFiles);
    });

    files.forEach(function (file) {
        stream.write(file);
    });

    stream.end();
}

describe('gulp-extify', function(){
    describe("file ordering", function () {
        it("should pipe a single file", function () {
            sort([fixture("app/Application.js")], function(resultFiles) {
                resultFiles.length.should.equal(1);
                resultFiles[0].should.equal("app\\Application.js");
            });
        });

        describe("requires", function () {
            it("should put Root before application because application depends on root independent of file input ordering", function () {
                sort([fixture("app/Application.js"),fixture("app/controller/Root.js")], function(resultFiles) {
                    resultFiles.length.should.equal(2);
                    resultFiles[0].should.equal("app\\controller\\Root.js");
                    resultFiles[1].should.equal('app\\Application.js');

                });
                sort([fixture("app/controller/Root.js"),fixture("app/Application.js")], function(resultFiles) {
                    resultFiles.length.should.equal(2);
                    resultFiles[0].should.equal("app\\controller\\Root.js");
                    resultFiles[1].should.equal('app\\Application.js');
                });
            });
        });

        describe("extend", function () {
            it("should put base.root before controller.root because controller.root depends on base.root independent of file input ordering", function () {
                sort([fixture("app/Application.js"),fixture("app/controller/Root.js"),fixture("app/base/Root.js")], function(resultFiles) {
                    resultFiles.length.should.equal(3);
                    resultFiles[0].should.equal("app\\base\\Root.js");
                    resultFiles[1].should.equal("app\\controller\\Root.js");
                    resultFiles[2].should.equal("app\\Application.js");
                });
                sort([fixture("app/Application.js"),fixture("app/base/Root.js"),fixture("app/controller/Root.js")], function(resultFiles) {
                    resultFiles.length.should.equal(3);
                    resultFiles[0].should.equal("app\\base\\Root.js");
                    resultFiles[1].should.equal("app\\controller\\Root.js");
                    resultFiles[2].should.equal("app\\Application.js");
                });
            });
        });

        describe("mixins", function () {
            it("should put base.root before controller.root because controller.root depends on base.root independent of file input ordering", function () {
                sort([
                    fixture("app/mixin/MyMixin.js"),
                    fixture("app/mixin/MyOtherMixin.js"),
                    fixture("app/Application.js"),
                    fixture("app/controller/Root.js"),
                    fixture("app/base/Root.js"),

                ], function(resultFiles) {
                    resultFiles.length.should.equal(5);
                    resultFiles.indexOf('app\\base\\Root.js').should.be.below(resultFiles.indexOf('app\\controller\\Root.js'));
                    resultFiles.indexOf('app\\mixin\\MyOtherMixin.js').should.be.below(resultFiles.indexOf('app\\controller\\Root.js'));
                    resultFiles.indexOf('app\\mixin\\MyMixin.js').should.be.below(resultFiles.indexOf('app\\controller\\Root.js'));
                    resultFiles.indexOf('app\\controller\\Root.js').should.be.below(resultFiles.indexOf('app\\Application.js'));
                });
            });
        });
    });
});