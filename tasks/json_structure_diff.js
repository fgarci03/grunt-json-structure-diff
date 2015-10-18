/*
 * grunt-json-structure-diff
 * https://github.com/fgarci03/grunt-json-structure-diff
 *
 * Copyright (c) 2015 Filipe Garcia
 * Licensed under the MIT license.
 */

(function () {
  'use strict';

  var compareJSONObjects = require('json-structure-diff').compareJSONObjects;

  var getFilesToCompare = function (fileIndex, sourceFiles, numberOfFolders) {
    var filesList = [];

    for (var i = 0; i < numberOfFolders; i++) {
      filesList.push(sourceFiles[i].files[fileIndex]);
    }

    return filesList;
  };

  var getNumberOfFiles = function (foldersContent) {
    var numberOfFiles = 0;

    for (var i = 0; i < foldersContent.length - 1; i++) {
      if (foldersContent[i].files.length !== foldersContent[i + 1].files.length) {
        return null;
      }

      numberOfFiles = foldersContent[0].files.length;
    }

    return numberOfFiles;
  };

  var getListOfErrors = function (foldersContent, numberOfFiles, numberOfFolders) {
    var errors = {};

    for (var i = 0; i < numberOfFiles; i++) {
      var filename = foldersContent[0].files[i] ? foldersContent[0].files[i].filename : null;

      if (filename) {
        errors[filename] = compareJSONObjects(getFilesToCompare(i, foldersContent, numberOfFolders), {humanReadable: true});
        if (errors[filename] && errors[filename].length) {
          errors.$areThereErrors = true;
        }
      }
    }

    return errors;
  };

  var getFormattedErrorListForLog = function (errorList) {
    var formattedErrors = '';
    var log = [];

    for (var file in errorList) {
      if (errorList.hasOwnProperty(file) && errorList[file] && errorList[file].length && file !== '$areThereErrors') {
        formattedErrors += 'File: ' + file + '\n\n';

        for (var j = 0; j < errorList[file].length; j++) {
          formattedErrors += errorList[file][j] + '\n';
        }

        formattedErrors += '\n\n';
        log.push(errorList[file]);
      }
    }

    return {
      log: log,
      errors: formattedErrors
    };
  };

  module.exports = function (grunt) {
    grunt.registerMultiTask('json_structure_diff', 'Compare 2 JSON objects for structure equality, despite the actual content', function () {
      var options = this.options({
        breakOnFail: false,
        verbose: true
      });

      this.files.forEach(function (listOfFolders) {
        var foldersContent = listOfFolders.src.map(function (folder) {
          var contents = [];

          grunt.file.expand(folder + '/*').forEach(function (file) {
            if (grunt.file.isDir(file)) {
              grunt.fail.warn('No recursive checks inside folders yet!!!');
            }

            contents.push({
              parent: file,
              filename: file.replace(folder + '/', ''),
              content: grunt.file.readJSON(file)
            });
          });

          return {
            folder: folder,
            files: contents.sort()
          };

          /*
           // todo: allow files to be used as input instead of folders

           if (grunt.file.isFile) {
           // Read file source and return the formatted object.
           return {
           parent: filepath,
           content: grunt.file.readJSON(filepath)
           };
           } else {
           grunt.fail.warn('Input \'files\' are not files not directories????');
           }
           return returnObject;
           });*/
        });

        var numberOfFolders = foldersContent.length;
        var numberOfFiles = getNumberOfFiles(foldersContent) || grunt.fail.warn('Folders don\'t have the same number of files');
        var errorList = getListOfErrors(foldersContent, numberOfFiles, numberOfFolders);

        if (errorList.$areThereErrors) {
          var formattedErrors = getFormattedErrorListForLog(errorList);

          if (options.verbose) {
            var errorOptions = {
              separator: '\n',
              color: 'red'
            };

            for (var i = 0; i < formattedErrors.log.length; i++) {
              grunt.log.error(grunt.log.wordlist(formattedErrors.log[i], errorOptions));
            }
          }

          grunt.file.write(listOfFolders.dest, formattedErrors.errors);

          var failMessage = 'The JSON objects don\'t match. Check ' + listOfFolders.dest + ' for more details.';
          options.breakOnFail ? grunt.fail.warn(failMessage) : grunt.log.error(grunt.log.wordlist([failMessage], {color: 'yellow'}));
        } else {
          grunt.log.ok('All files have the same structure!');
        }
      });
    });
  };
})();
