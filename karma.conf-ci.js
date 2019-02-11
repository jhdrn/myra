var fs = require('fs');

module.exports = function (config) {

    // Use ENV vars on Travis and sauce.json locally to get credentials
    // if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
    //     console.log('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set.')
    //     process.exit(1)
    // }

    // Browsers to run on Sauce Labs
    var customLaunchers = {
        'Chrome_travis_ci': {
            base: 'Chrome',
            flags: ['--no-sandbox']
        },
        // 'SL_Chrome': {
        //     base: 'SauceLabs',
        //     browserName: 'chrome'
        // },
        // 'SL_InternetExplorer11': {
        //     base: 'SauceLabs',
        //     browserName: 'internet explorer',
        //     version: '11'
        // },
        // 'SL_InternetExplorer10': {
        //     base: 'SauceLabs',
        //     browserName: 'internet explorer',
        //     version: '10'
        // },
        // 'SL_InternetExplorer9': {
        //     base: 'SauceLabs',
        //     browserName: 'internet explorer',
        //     version: '9'
        // },
        // 'SL_FireFox': {
        //     base: 'SauceLabs',
        //     browserName: 'firefox',
        // },
        // 'SL_IOS_Safari': {
        //     base: 'SauceLabs',
        //     browserName: 'iphone',
        //     platform: 'OS X 10.9',
        //     version: '7.1'
        // },
        // 'SL_IOS_Safari_Latest': {
        //     base: 'SauceLabs',
        //     browserName: 'iphone',
        //     platform: 'OS X 10.11',
        //     version: '9.3'
        // },
        // 'SL_Android': {
        //     base: 'SauceLabs',
        //     browserName: 'android',
        //     platform: 'Linux',
        //     version: '4.2'
        // },
        // 'SL_Android_Latest': {
        //     base: 'SauceLabs',
        //     browserName: 'android',
        //     platform: 'Linux'
        // },
        // 'SL_Edge': {
        //     base: 'SauceLabs',
        //     browserName: 'MicrosoftEdge',
        //     platform: 'Windows 10',
        //     version: '13'
        // },
        // 'SL_Safari': {
        //     base: 'SauceLabs',
        //     browserName: 'safari',
        //     platform: 'OS X 10.10',
        //     version: '8'
        // }
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
        reporters: ['dots', 'coverage'/*, 'saucelabs'*/],

        // web server port
        port: 9876,

        colors: true,

        client: {
            captureConsole: false,
            // env: {
            //     AJAX_WAIT: 3000, // time in ms to tell ajax-based tests to wait for (saucelabs runners are very slow)
            //     JASMINE_TIMEOUT: 20000 // time that jasmine will wait for async requests to complete
            // }
        },

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_ERROR,

        // sauceLabs: {
        //     testName: 'Myra unit tests',            
        //     recordScreenshots: false,
        //     connectOptions: {
        //         port: 5757,
        //         logfile: 'sauce_connect.log'
        //     },
        //     retryLimit: 2,
        //     // startConnect: false,
        //     // public: 'public'
        // },
        // captureTimeout: 200000,
        customLaunchers: customLaunchers,

        // browserDisconnectTimeout: 30000,
        // browserDisconnectTolerance: 1,
        // browserNoActivityTimeout: 200000,

        // Karma plugins loaded
        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            // 'karma-sauce-launcher',
            'karma-coverage'
        ],

        // Source files that you wanna generate coverage for.
        // Do not include tests or libraries (these files will be instrumented by Istanbul)
        preprocessors: {
            './build/src/**/*.js': ['coverage']
        },

        coverageReporter: {
            dir: './coverage/',
            includeAllSources: true,
            reporters: [
                { type: 'json', subdir: '.', file: 'coverage.json' }
            ]
        },

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: Object.keys(customLaunchers),
        singleRun: true
    });
};
