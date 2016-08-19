var fs = require('fs');

module.exports = function(config) {

  // Use ENV vars on Travis and sauce.json locally to get credentials
  if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
    console.log('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set.')
    process.exit(1)
  }

  // Browsers to run on Sauce Labs
  var customLaunchers = {
    'SL_Chrome': {
      base: 'SauceLabs',
      browserName: 'chrome'
    },
    'SL_InternetExplorer11': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      version: '11'
    },
    'SL_InternetExplorer10': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      version: '10'
    },
    'SL_InternetExplorer9': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      version: '9'
    },
    'SL_FireFox': {
      base: 'SauceLabs',
      browserName: 'firefox',
    }
  };

  config.set({

    basePath: './',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    files: [
        // paths loaded by Karma
        { pattern: 'node_modules/systemjs/dist/system-polyfills.js', included: true, watched: true },
        { pattern: 'node_modules/systemjs/dist/system.js', included: true, watched: true },
        { pattern: 'test/karma-test-shim.js', included: true, watched: true },
        { pattern: 'test/test.json', included: false, watched: true, served: true },

        // paths loaded via module imports
        { pattern: 'build/**/*.js', included: false, watched: true },
        { pattern: 'test/**/*.ts', included: false, watched: true },
        { pattern: 'test/**/*.tsx', included: false, watched: true },

        // paths to support debugging with source maps in dev tools
        { pattern: 'build/src/**/*.ts', included: false, watched: false },
        { pattern: 'build/**/*.js.map', included: false, watched: false }
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots', 'saucelabs'],

    // web server port
    port: 9876,

    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    sauceLabs: {
        testName: 'Myra unit tests',
        recordScreenshots: false,
        connectOptions: {
            port: 5757,
            logfile: 'sauce_connect.log'
        },
        // startConnect: false,
        // public: 'public'
    },
    captureTimeout: 120000,
    customLaunchers: customLaunchers,

    // Karma plugins loaded
    plugins: [
        'karma-jasmine',
        'karma-sauce-launcher'
    ],

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: Object.keys(customLaunchers),
    singleRun: true
  });
};