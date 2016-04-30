Wallaby Angular Filesort Postprocessor
---

[![Build Status](https://travis-ci.org/ryanwischkaemper/wallaby-angular-filesort.svg?branch=master)](https://travis-ci.org/ryanwischkaemper/wallaby-angular-filesort)

#Installation

`npm install wallaby-angular-filesort`

#Usage

// Wallaby.js configuration

```
var wallabyAngularFilesort = require('wallaby-angular-filesort');
var wallabyPostprocessor = wallabyAngularFilesort({
  whitelist: ['src/**/*.js']
});

module.exports = function (wallaby) {
  return {
    // set `load: false` to all Angular source files
    // (except external files)
    files: [
      {pattern: 'src/**/*.js', load: false}
    ],

    tests: [
      'test/**/*Spec.js'
    ],

    postprocessor: wallabyPostprocessor
  };
};

```
