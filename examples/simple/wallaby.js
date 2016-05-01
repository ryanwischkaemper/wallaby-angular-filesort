var wallabyAngularFilesort  = require('../../lib/index');

var wallabyPostprocessor  = wallabyAngularFilesort.create({
  whitelist: ['app/**/*.js']
});


module.exports = function () {

  return {
    files: [
      { "pattern": "lib/angular.js", "instrument": false },
      { "pattern": "lib/angular-mocks.js", "instrument": false },

       "app/**/*.js"
    ],

    tests: [
      "test/*.spec.js"
    ],

    postprocessor: wallabyPostprocessor,
    debug: true
  }
};
