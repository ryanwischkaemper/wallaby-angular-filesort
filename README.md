Wallaby Angular Filesort Postprocessor
---
[![Build Status](https://travis-ci.org/ryanwischkaemper/wallaby-angular-filesort.svg?branch=master)](https://travis-ci.org/ryanwischkaemper/wallaby-angular-filesort)
[![Coverage Status](https://coveralls.io/repos/github/ryanwischkaemper/wallaby-angular-filesort/badge.svg?branch=master)](https://coveralls.io/github/ryanwischkaemper/wallaby-angular-filesort?branch=master)
[![npm version](https://badge.fury.io/js/wallaby-angular-filesort.svg)](https://badge.fury.io/js/wallaby-angular-filesort)


#Installation

```bash
npm install wallaby-angular-filesort --save-dev
```


# Usage

#### Wallaby.js configuration

```javascript
var wallabyAngularFilesort = require('wallaby-angular-filesort');
var wallabyPostprocessor = wallabyAngularFilesort.create({
  whitelist: ['src/**/*.js']
});

module.exports = function (wallaby) {
  return {
    files: [
      // load Angular source files normally (instrumented = true and loaded = true)
    ],
    tests: [
      'test/**/*Spec.js'
    ],

    postprocessor: wallabyPostprocessor
  };
};

```

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/ryanwischkaemper/wallaby-angular-filesort/issues/new)

## Building

```batch
npm install
npm run build
```


## Running Tests

Tests can be run with `npm` or with [WallabyJS](https://wallabyjs.com/) if that is available to you.

Run once via `npm`:

```batch
npm test
```
Run continuously while watching for changes via `npm`:

```batch
npm run test:watch
```
