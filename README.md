# grunt-json-structure-diff

> Compare 2 JSON objects for structure equality, despite the actual content

## Important Note
This plugin is on **EARLY** stage of development, is not properly tested, and does not yet allow a number of customizations I planned for it.
Be careful if you use it on your projects! Make sure you provide the exact version you want to use until a stable version is released.

## Getting Started
This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-json-structure-diff --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-json-structure-diff');
```

## The "json_structure_diff" task

### Overview
In your project's Gruntfile, add a section named `json_structure_diff` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  json_structure_diff: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

This plugin takes a list of folders containing JSON files. The folders MUST have the exact same structure (number of files and file names).
It will then compare each file with their counterparts in the other folders and return an error list if the structures don't match. The
error list is displayed in the Grunt console and is printed into the file pointed to in the configurations.

### Options

#### options.breakOnFail
Type: `Boolean`
Default value: `false`

Whether it should abort the Grunt task on error or not.

### Usage Examples

#### Default Options

```js
grunt.initConfig({
  json_structure_diff: {
    options: {},
    files: {
      'logs/log.txt': ['src/folderWithJson1', 'src/folderWithJson2'],
    },
  },
})
```

#### Custom Options
In this example, if an error is found, Grunt is aborted immediately.

```js
grunt.initConfig({
  json_structure_diff: {
    options: {
      breakOnFail: true,
    },
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
})
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2015 Filipe Garcia. Licensed under the MIT license.
