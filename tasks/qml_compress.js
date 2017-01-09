/*
 * grunt-qml-compress
 * https://github.com/slin/grunt-qml-compress
 *
 * Copyright (c) 2017 sawyerlin
 * Licensed under the MIT license.
 */

'use strict';
var walk = require('node-file-walker'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp');

module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks
    grunt.registerMultiTask('qml_compress', 'compress qml project', function() {
        var options = this.options({
            qmlRoot: "test/input",
            outputRoot: "test/output"
        }),
        currentDir = options.qmlRoot,
        currentOutputDir = options.outputRoot,
        done = this.async();
        this.files.forEach(function(f) {
            var src = f.src.filter(function(filePath) {
                if (!grunt.file.exists(filePath)) {
                    grunt.log.warn('Source file "' + filePath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function(filePath) {
                if (grunt.file.isDir(filePath)) {
                    walkDir(filePath);
                } else if (grunt.file.isFile(filePath)) {
                    var currentOutputFile = path.join(options.outputRoot, filePath.replace(options.qmlRoot, ""));
                    if (currentOutputFile.indexOf('.qml') !== -1) {
                        fs.readFile(filePath, 'utf8', function(err, data) {
                            if (err) {
                                throw err;
                            }
                            mkdirp(path.dirname(currentOutputFile), function (err) {
                                fs.writeFile(currentOutputFile, compress(data), {
                                    flag: 'w+'
                                }, function(err) {
                                    if (err) {
                                        throw err;
                                    }
                                });
                            });
                        });
                    } else {
                        if (filePath[0] !== '.') {
                            fs.createReadStream(filePath).pipe(fs.createWriteStream(currentOutputFile));
                        } else {
                            console.log(filePath);
                        }
                    }
                }
            });
        });

        function walkDir(dir) {
            walk(dir, function(dir, files, level) {
                if (dir.indexOf("node_modules") === -1) {
                    if (dir.indexOf('.git') === -1) {
                        files.forEach(function(fileName, index) {
                            if (fileName[0] !== '.') {
                                if (path.extname(fileName).length > 1 || 
                                        fileName.indexOf('qmldir') !== -1) {
                                    var outputRootDir = path.join(options.outputRoot, dir.replace(options.qmlRoot, ""));
                                    mkdirp(outputRootDir, function (err) {
                                        if (err) {
                                            throw err;
                                        }
                                        var currentFile = path.join(dir, fileName),
                                            currentOutputFile = path.join(outputRootDir, fileName);
                                        if (fileName.indexOf('.qml') !== -1) {
                                            fs.readFile(currentFile, 'utf8', function(err, data) {
                                                if (err) {
                                                    throw err;
                                                }
                                                fs.writeFile(currentOutputFile, compress(data), {
                                                    flag: 'w+'
                                                }, function(err) {
                                                    if (err) {
                                                        throw err;
                                                    }
                                                });
                                            });
                                        } else {
                                            if (fileName[0] !== '.') {
                                                fs.createReadStream(currentFile).pipe(fs.createWriteStream(currentOutputFile));
                                            } else {
                                                console.log(fileName);
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });
        }

        function compress(data) {
            var compressString = "";
            data.replace(/(\s*)(.+)/ig, function(match, p1, p2) {
                var p2Test = p2.trim(),
                canAppend = false,
                isMatched = false;
                if (compressString[compressString.length - 1] === "]") {
                    canAppend = true;
                }
                if (p2Test[0] === '/' || p2Test[1] === '/') {
                    return;
                }

                p2.replace(/(.*)[^:]\/\/.*/ig, function(match, p11, p22) {
                    isMatched = true;
                    compressString += p11;
                    if (compressString[compressString.length - 1] !== ";") {
                        compressString += ";";
                    }
                });
                if (!isMatched) {
                    if (compressString[compressString.length - 1] === ";") {
                        if ((p2Test[0] === "}" || 
                                    p2Test[0] === "." || 
                                    p2Test[0] === "'" || 
                                    p2Test[0] === "\"" || 
                                    p2Test[0] === "+" || 
                                    p2Test[0] === "-" || 
                                    p2Test[0] === "*" || 
                                    p2Test[0] === "/" || 
                                    p2Test[0] === "&" || 
                                    p2Test[0] === "|" ) && 
                                compressString.slice(compressString.length - 6, compressString.length - 1) !== "break") {
                            compressString = compressString.slice(0, -1);
                        }
                    } else {
                        if (p2Test[0] !== "}" && 
                                p2Test[0] !== "]" && 
                                p2Test[0] !== "," &&
                                canAppend) {
                            p2 = ";" + p2;
                        }
                    }
                    if (p2Test[p2Test.length - 1] !== "{" && 
                            p2Test[p2Test.length - 1] !== "}" && 
                            p2Test[p2Test.length - 1] !== "[" && 
                            p2Test[p2Test.length - 1] !== "]" && 
                            p2Test[p2Test.length - 1] !== ";" && 
                            p2Test[p2Test.length - 1] !== "+" && 
                            p2Test[p2Test.length - 1] !== ",") {
                        compressString += p2 + ";";
                    } else {
                        compressString += p2;
                    }

                }
            });
            return compressString;
        }
    });



};
