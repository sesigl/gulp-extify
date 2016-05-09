var fs = require('fs');

eval(fs.readFileSync("./test/testSetup.js")+"");


function assert(resultFilesFn) {
    sort([
        fixture("regression"+path.sep+"braceCount"+path.sep+"app"+path.sep+"BraceCountApplication.js"),
        fixture("regression"+path.sep+"braceCount"+path.sep+"app"+path.sep+"includes"+path.sep+"ClassWithMissleadingBraces.js")
    ], resultFilesFn);
}

it("should parse classes with braces with strings and regexp correctly", function () {
    assert(function (resultFiles) {
        resultFiles.indexOf("regression"+path.sep+"braceCount"+path.sep+"app"+path.sep+"includes"+path.sep+"ClassWithMissleadingBraces.js")
            .should.not.equal(-1);
    });
});
