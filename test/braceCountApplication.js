var fs = require('fs');

eval(fs.readFileSync("./test/testSetup.js")+"");


function assert(resultFilesFn) {
    sort([
        fixture("regression"+path.sep+"allowTabIntention"+path.sep+"app"+path.sep+"AllowTabIntentionsApplication.js"),
        fixture("regression"+path.sep+"allowTabIntention"+path.sep+"app"+path.sep+"includes"+path.sep+"Application.js"),
        fixture("regression"+path.sep+"allowTabIntention"+path.sep+"app"+path.sep+"includes"+path.sep+"Mixin.js"),
        fixture("regression"+path.sep+"allowTabIntention"+path.sep+"app"+path.sep+"includes"+path.sep+"Mixin2.js"),
        fixture("regression"+path.sep+"allowTabIntention"+path.sep+"app"+path.sep+"includes"+path.sep+"Model.js"),
        fixture("regression"+path.sep+"allowTabIntention"+path.sep+"app"+path.sep+"includes"+path.sep+"SomeClass.js"),
        fixture("regression"+path.sep+"allowTabIntention"+path.sep+"app"+path.sep+"includes"+path.sep+"SomeClass2.js")
    ], resultFilesFn);
}

it("should parse extend", function () {
    assert(function (resultFiles) {
        resultFiles.indexOf("regression"+path.sep+"allowTabIntention"+path.sep+"app"+path.sep+"AllowTabIntentionsApplication.js")
            .should.be.above(resultFiles.indexOf("regression"+path.sep+"allowTabIntention"+path.sep+"app"+path.sep+"includes"+path.sep+"Application.js"));
    });
});

it("should parse mixin", function () {
    assert(function (resultFiles) {
        resultFiles.indexOf("regression"+path.sep+"allowTabIntention"+path.sep+"app"+path.sep+"AllowTabIntentionsApplication.js")
            .should.be.above(resultFiles.indexOf("regression"+path.sep+"allowTabIntention"+path.sep+"app"+path.sep+"includes"+path.sep+"Mixin.js"));
        resultFiles.indexOf("regression"+path.sep+"allowTabIntention"+path.sep+"app"+path.sep+"AllowTabIntentionsApplication.js")
            .should.be.above(resultFiles.indexOf("regression"+path.sep+"allowTabIntention"+path.sep+"app"+path.sep+"includes"+path.sep+"Mixin2.js"));
    });
});

it("should parse model", function () {
    assert(function (resultFiles) {
        resultFiles.indexOf("regression"+path.sep+"allowTabIntention"+path.sep+"app"+path.sep+"AllowTabIntentionsApplication.js")
            .should.be.above(resultFiles.indexOf("regression"+path.sep+"allowTabIntention"+path.sep+"app"+path.sep+"includes"+path.sep+"Model.js"));
    });
});

it("should parse requires", function () {
    assert(function (resultFiles) {
        resultFiles.indexOf("regression"+path.sep+"allowTabIntention"+path.sep+"app"+path.sep+"AllowTabIntentionsApplication.js")
            .should.be.above(resultFiles.indexOf("regression"+path.sep+"allowTabIntention"+path.sep+"app"+path.sep+"includes"+path.sep+"SomeClass.js"));
        resultFiles.indexOf("regression"+path.sep+"allowTabIntention"+path.sep+"app"+path.sep+"AllowTabIntentionsApplication.js")
            .should.be.above(resultFiles.indexOf("regression"+path.sep+"allowTabIntention"+path.sep+"app"+path.sep+"includes"+path.sep+"SomeClass2.js"));
    });
});