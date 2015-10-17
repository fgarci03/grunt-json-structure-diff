/*
 * grunt-json-structure-diff
 * https://github.com/fgarci03/grunt-json-structure-diff
 *
 * Copyright (c) 2015 Filipe Garcia
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

  function compareJSONObjects(srcObjs, isNested) {
    var errors = [];

    function compare(objs, nested) {
      // iterate the array of objects to compare
      for (var i = 0; i < objs.length; i++) {

        // iterate each object's properties
        for (var prop in objs[i].content) {
          if (objs[i].content.hasOwnProperty(prop)) {
            var separator = nested ? '.' : ' > ';

            // iterate the rest of the array to get the remaining objects
            for (var j = i + 1; j < objs.length; j++) {
              if (typeof objs[i].content[prop] === typeof objs[j].content[prop]) {

                // if the property is also an object, recursively check it
                if (typeof objs[i].content[prop] === 'object') {
                  var formattedObjects = [
                    {
                      parent: objs[i].parent + separator + prop,
                      content: objs[i].content[prop]
                    },
                    {
                      parent: objs[j].parent + separator + prop,
                      content: objs[j].content[prop]
                    }
                  ];
                  compare(formattedObjects, true);
                }
              } else {
                errors.push(objs[i].parent + separator + prop + ' is ' + typeof objs[i].content[prop] + ' and ' + objs[j].parent + separator + prop + ' is ' + typeof objs[j].content[prop]);
              }
            }
          }
        }
      }
    }

    compare(srcObjs, isNested);
    return errors;
  }

  var getFilesToCompare = function (fileIndex, sourceFiles, numberOfFolders) {
    var filesList = [];

    for (var j = 0; j < numberOfFolders; j++) {
      filesList.push(sourceFiles[j].files[fileIndex]);
    }

    return filesList;
  };

  grunt.registerMultiTask('json_structure_diff', 'Compare 2 JSON objects for structure equality, despite the actual content', function () {
    var options = this.options({
      breakOnFail: false
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

        // todo: allow files to be used as input instead of folders
        /*
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
      var numberOfFiles = 0;
      var errors = {};

      for (var i = 0; i < foldersContent.length - 1; i++) {
        if (foldersContent[i].files.length !== foldersContent[i + 1].files.length) {
          grunt.fail.warn('Folders don\'t have the same number of files');
        }

        numberOfFiles = foldersContent[0].files.length;
      }

      for (var k = 0; k < numberOfFiles; k++) {
        var filename = foldersContent[0].files[k] ? foldersContent[0].files[k].filename : null;

        if (filename) {
          errors[filename] = compareJSONObjects(getFilesToCompare(k, foldersContent, numberOfFolders));
          if (errors[filename].length) {
            errors.$areThereErrors = true;
          }
        }
      }

      if (errors.$areThereErrors) {
        var formattedErrorsToFile = '';
        for (var file in errors) {
          var errorOptions = {
            separator: '\n',
            color: 'red'
          };

          if (errors.hasOwnProperty(file) && errors[file].length && file !== '$areThereErrors') {
            formattedErrorsToFile += 'File: ' + file + '\n\n';

            for (i = 0; i < errors[file].length; i++) {
              formattedErrorsToFile += errors[file][i] + '\n';
            }

            formattedErrorsToFile += '\n\n';
            grunt.log.error(grunt.log.wordlist(errors[file], errorOptions));
          }
        }
        grunt.file.write(listOfFolders.dest, formattedErrorsToFile);

        var failMessage = 'The JSON objects don\'t match. Check ' + listOfFolders.dest + ' for more details.';
        if (options.breakOnFail) {
          grunt.fail.warn(failMessage);
        } else {
          grunt.log.error(grunt.log.wordlist([failMessage], {color: 'yellow'}));
        }
      } else {
        grunt.log.ok('All files have the same structure!');
      }
    });
  });
};
