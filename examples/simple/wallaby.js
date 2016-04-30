var sorter = require('../../lib/index');

var sorterProcessor = sorter({
  whitelist: ['app/**/*.js']
});


module.exports = function () {

  return {
    files: [
      { "pattern": "lib/angular.js", "instrument": false },
      { "pattern": "lib/angular-mocks.js", "instrument": false },

      { "pattern": "app/**/*.js", "load":false }
    ],

    tests: [
      "test/*.spec.js"
    ],

    postprocessor: sorterProcessor,
    debug: true
  }
};
