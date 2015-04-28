var assert = require("assert"); // node.js core module
var extDependencies = require("../main.js"); // node.js core module
describe('gulp-extjs-dependencies', function(){
    it("should pipe simple file names", function () {
        assert.deepEqual(extDependencies('myFile.js'), ['myFile.js']);
    });
});