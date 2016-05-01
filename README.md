Wallaby Angular Filesort Postprocessor
---

[![Build Status](https://travis-ci.org/ryanwischkaemper/wallaby-angular-filesort.svg?branch=master)](https://travis-ci.org/ryanwischkaemper/wallaby-angular-filesort)
[![Coverage Status](https://coveralls.io/repos/github/ryanwischkaemper/wallaby-angular-filesort/badge.svg?branch=master)](https://coveralls.io/github/ryanwischkaemper/wallaby-angular-filesort?branch=master)


> This product is not yet ready for a production environment


#Installation

```bash
npm install wallaby-angular-filesort --save-dev
```


#Usage

// Wallaby.js configuration

```javascript
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
