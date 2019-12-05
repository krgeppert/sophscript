var fs = require("fs");
var path = require("path");
var parseCsv = require("csv-parse");

var cwd = process.cwd();
var inputDirectory = path.resolve(cwd, process.argv[2]);
var transformFile = path.resolve(cwd, process.argv[3]);
var outputFile = path.resolve(cwd, process.argv[4]);

var basePairings = {
    a: "t",
    t: "a",
    c: "g",
    g: "c"
};

var transformCsv = fs.readFileSync(transformFile, "utf8");
var inputFiles = fs.readdirSync(inputDirectory, "utf8");
var inputs = inputFiles.filter(function (file) {
    return file.slice(file.length - 4) === ".seq"
}).map(function (inputFile) {
    return fs.readFileSync(path.resolve(inputDirectory, inputFile), "utf8");
});

console.log("found " + inputs.length + " .seq files in directory " + inputDirectory);

var complementDnaString = function (dnaStr) {
    var result = "";
    for (var i = 0; i < dnaStr.length; i++) {
        var char = dnaStr[i].toLowerCase();
        result += basePairings[char] || char;
    }
    return result;
};

var reverseString = function (str) {
    var result = "";
    for (var i = 0; i < str.length; i++) {
        result += str[str.length - i - 1];
    }
    return result;
};

parseCsv(transformCsv, function (err, transforms) {
    if (err) {
        throw err
    }
    console.log("" + transforms.length + " possible transformations found in " + transformFile);
    var result = "";
    var matches = 0;
    inputs.forEach(function (input) {
        var lines = input.split("\n").filter(function (a) {
            return !!a.length
        });
        var inputName = lines[0];
        var inputNamePieces = inputName.split("_").filter(function (a) {
            return !!a.length
        });
        transforms.forEach(function (transform) {
            var isMatch = true;
            var transformSpecifiers = transform.slice(0, transform.length - 2).map(function (a) {
                return a.trim()
            });
            ;
            for (var i = 0; i < transformSpecifiers.length; i++) {
                isMatch = isMatch && transformSpecifiers[i].toLowerCase() === inputNamePieces[i].toLowerCase();
            }
            if (isMatch) {
                matches++;
                var dnaStrand = lines.slice(1).reduce(function (agg, line) {
                    return agg + line.trim();
                }, "");
                var range = [
                    parseInt(transform[transform.length - 2], 10) - 1,
                    parseInt(transform[transform.length - 1], 10) - 1
                ];
                var resultName = transformSpecifiers.join("_");
                var dnaSlice = dnaStrand.slice(range[0], range[1]).trim();

                result = result + resultName + "_F\n" + dnaSlice.toUpperCase() + "\n";
                result = result + resultName + "_RV\n" + reverseString(dnaSlice).toUpperCase() + "\n";
                result = result + resultName + "_C\n" + complementDnaString(dnaSlice).toUpperCase() + "\n";
                result = result + resultName + "_RC\n" + reverseString(complementDnaString(dnaSlice)).toUpperCase() + "\n";
            }
        });
    });
    console.log("" + matches + " transform matches found.");

    fs.writeFileSync(outputFile, result);
    console.log("output written to " + outputFile);

});

