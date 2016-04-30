module.exports = function (wallaby) {

  return {
    files: [
      'src/**/*.js',
      "!test/**/*.spec.js",
      'test/**/*.js'
    ],

    tests: [
      "test/**/*.spec.js"
    ],

    compilers: {
      '**/*.js': wallaby.compilers.babel()
    },

    env: {
      type:'node',
      runner:'node'
    },

    testFramework: 'mocha'
  }
};
