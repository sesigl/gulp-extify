var chai = require('chai'),
    should = chai.should(),
    extify = require("./../"),
    Vinyl = require('vinyl'),
    fs = require('fs'),
    path = require("path");


function fixture(file, config) {
    var filepath = path.join(__dirname, file);
    return new Vinyl({
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