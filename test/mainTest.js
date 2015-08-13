var chai = require('chai'),
    should = chai.should(),
    extify = require("./../"),
    gutil = require('gulp-util'),
    path = require('path'),
    fs = require('fs'),
    path = require("path");


function fixture(file, config) {
    var filepath = path.join(__dirname, file);
    return new gutil.File({
        path: filepath,
        cwd: __dirname,
        base: __dirname,
        contents: config && config.withoutContents ? undefined : fs.readFileSync(filepath)
    });
}

function sort(files, checkResults, handleError) {
    var resultFiles = [];

    var stream = extify();

    stream.on('data', function (file) {
        resultFiles.push(file.relative);
    });

    stream.on('error', function (err) {
        if (handleError) {
            handleError(err);
        } else {
            should.exist(err);
        }
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
                resultFiles[0].should.equal("app"+path.sep+"Application.js");
            });
        });

        describe("general parse behaviors", function () {
            it("should parse all Ext.define's", function () {
                sort([
                    fixture("app/mixin/MyMixin.js"),
                    fixture("app/base/Root.js"),
                    fixture("app/controller/MulitpleDefinitionsInOneFileController.js")
                ], function(resultFiles) {
                    resultFiles.length.should.equal(3);
                    resultFiles.indexOf("app"+path.sep+"controller"+path.sep+"MulitpleDefinitionsInOneFileController.js")
                        .should.be.below(resultFiles.indexOf("app"+path.sep+"mixin"+path.sep+"MyMixin.js"));
                });
            });
        });

        describe("requires", function () {
            it("should put Root before application because application depends on root independent of file input ordering", function () {
                sort([fixture("app/Application.js"),fixture("app/controller/Root.js")], function(resultFiles) {
                    resultFiles.length.should.equal(2);
                    resultFiles[0].should.equal("app"+path.sep+"controller"+path.sep+"Root.js");
                    resultFiles[1].should.equal("app"+path.sep+"Application.js");

                });
                sort([fixture("app/controller/Root.js"),fixture("app/Application.js")], function(resultFiles) {
                    resultFiles.length.should.equal(2);
                    resultFiles[0].should.equal("app"+path.sep+"controller"+path.sep+"Root.js");
                    resultFiles[1].should.equal("app"+path.sep+"Application.js");
                });
            });

            it("should requires classes that are plain strings and no array like require: 'myclass' ", function () {
                sort([fixture("app/requires/Req1.js"), fixture("app/requires/Req2.js")], function(resultFiles) {
                    resultFiles.length.should.equal(2);
                    resultFiles[0].should.equal("app" + path.sep + "requires"+path.sep+"Req2.js");
                    resultFiles[1].should.equal("app" + path.sep + "requires"+path.sep+"Req1.js");
                });
            });
        });

        describe("extend", function () {
            it("should put base.root before controller.root because controller.root depends on base.root independent of file input ordering", function () {
                sort([fixture("app/Application.js"),fixture("app/controller/Root.js"),fixture("app/base/Root.js")], function(resultFiles) {
                    resultFiles.length.should.equal(3);
                    resultFiles[0].should.equal("app"+path.sep+"base"+path.sep+"Root.js");
                    resultFiles[1].should.equal("app"+path.sep+"controller"+path.sep+"Root.js");
                    resultFiles[2].should.equal("app"+path.sep+"Application.js");
                });
                sort([fixture("app/Application.js"),fixture("app/base/Root.js"),fixture("app/controller/Root.js")], function(resultFiles) {
                    resultFiles.length.should.equal(3);
                    resultFiles[0].should.equal("app"+path.sep+"base"+path.sep+"Root.js");
                    resultFiles[1].should.equal("app"+path.sep+"controller"+path.sep+"Root.js");
                    resultFiles[2].should.equal("app"+path.sep+"Application.js");
                });
            });
        });

        describe("mixins", function () {
            it("should parse simple mixins", function () {
                sort([
                    fixture("app/controller/BindableController.js"),
                    fixture("app/mixin/BindableMixin.js"),
                    fixture("app/mixin/BindableMixinOther.js"),

                ], function(resultFiles) {
                    resultFiles.length.should.equal(3);
                    resultFiles.indexOf("app"+path.sep+"mixin"+path.sep+"BindableMixin.js").should.be.below(resultFiles.indexOf("app"+path.sep+"controller"+path.sep+"BindableController.js"));
                    resultFiles.indexOf("app"+path.sep+"mixin"+path.sep+"BindableMixinOther.js").should.be.below(resultFiles.indexOf("app"+path.sep+"controller"+path.sep+"BindableController.js"));
                });
            });

            it("should parse object mixins", function () {
                sort([
                    fixture("app/base/Root.js"),
                    fixture("app/controller/Root.js"),
                    fixture("app/mixin/MyMixin.js"),
                    fixture("app/mixin/MyOtherMixin.js"),
                    fixture("app/Application.js"),

                ], function(resultFiles) {
                    resultFiles.length.should.equal(5);
                    resultFiles.indexOf("app"+path.sep+"base"+path.sep+"Root.js").should.be.below(resultFiles.indexOf("app"+path.sep+"controller"+path.sep+"Root.js"));
                    resultFiles.indexOf("app"+path.sep+"mixin"+path.sep+"MyOtherMixin.js").should.be.below(resultFiles.indexOf("app"+path.sep+"controller"+path.sep+"Root.js"));
                    resultFiles.indexOf("app"+path.sep+"mixin"+path.sep+"MyMixin.js").should.be.below(resultFiles.indexOf("app"+path.sep+"controller"+path.sep+"Root.js"));
                    resultFiles.indexOf("app"+path.sep+"controller"+path.sep+"Root.js").should.be.below(resultFiles.indexOf("app"+path.sep+"Application.js"));
                });
            });
        });

        describe("model", function () {
            it("should handle model defitions of stores like commmon depdendencies", function () {
                sort([
                    fixture("app/Application.js"),
                    fixture("app/controller/Root.js"),
                    fixture("app/store/MyStore.js"),
                    fixture("app/model/MyModel.js"),
                    fixture("app/base/Root.js"),

                ], function(resultFiles) {
                    resultFiles.length.should.equal(5);
                    resultFiles.indexOf("app"+path.sep+"model"+path.sep+"MyModel.js").should.be.below(resultFiles.indexOf("app"+path.sep+"store"+path.sep+"MyStore.js"));
                });
            });
        });
    });

    describe("errors", function () {
        it("should be read with gulp.src", function () {
            sort([
                "app/controller/Empty.js",
            ], function(resultFiles) {
                resultFiles.length.should.equal(0);
            }, function(err) {
                err.message.length.should.be.above(0);
                err.plugin.should.equal("gulp-extify");
            });
        });

        it("should have no circular dependencies", function () {
            sort([
                fixture("app/mixin/MyMixin.js"),
                fixture("app/mixin/MyOtherMixin.js"),
                fixture("app/Application.js"),
                fixture("app/controller/Root.js"),
                fixture("app/base/Root.js"),
                fixture("app/controller/CircDepControllerOne.js"),
                fixture("app/controller/CircDepControllerTwo.js")
            ], function(resultFiles) {

            }, function(err) {
                err.message.should.equal("At least 1 circular dependency in nodes: " +
                "\n" +
                "\n" +
                "My.controller.CircDepControllerOne\n" +
                "My.base.Root\n" +
                "My.controller.CircDepControllerTwo\n" +
                "\n" +
                "Graph cannot be sorted!");
                err.plugin.should.equal("gulp-extify");
            });
        });
    });
});