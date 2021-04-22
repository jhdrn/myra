module.exports = function (config) {
    config.set({

        basePath: './',

        frameworks: ['jasmine'],

        files: [
            // paths loaded by Karma
            'node_modules/systemjs/dist/system-polyfills.js',
            'node_modules/systemjs/dist/system.js',
            'test/karma-test-shim.js',
            {
                pattern: 'build/test/**/*.js',
                included: false,
                served: true
            },

            // paths loaded via module imports
            {
                pattern: 'build/**/*.js',
                included: false,
                watched: true
            }, {
                pattern: 'test/**/*.ts',
                included: false,
                watched: true
            }, {
                pattern: 'test/**/*.tsx',
                included: false,
                watched: true
            },

            // paths to support debugging with source maps in dev tools
            {
                pattern: 'build/src/**/*.ts',
                included: false,
                watched: false
            }, {
                pattern: 'build/**/*.js.map',
                included: false,
                watched: false
            }
        ],
        port: 9876,

        logLevel: config.LOG_INFO,

        colors: true,

        autoWatch: true,

        browsers: ['Chrome', 'Firefox', 'Safari', 'IE', 'IE10', 'Edge'],

        // For Travis CI
        customLaunchers: {
            Chrome_travis_ci: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            },
            IE10: {
                base: 'IE',
                'x-ua-compatible': 'IE=EmulateIE10'
            }
        },

        // Karma plugins loaded
        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-ie-launcher',
            'karma-edge-launcher',
            'karma-firefox-launcher',
            'karma-safari-launcher',
            'karma-spec-reporter',
            'karma-coverage'
        ],

        // Coverage reporter generates the coverage
        reporters: ['spec', 'coverage'],

        // Source files that you wanna generate coverage for.
        // Do not include tests or libraries (these files will be instrumented by Istanbul)
        preprocessors: {
            './build/src/**/*.js': ['coverage']
        },

        coverageReporter: {
            dir: './coverage/',
            includeAllSources: true,
            reporters: [{
                type: 'json',
                subdir: '.',
                file: 'coverage.json'
            }]
        },

        singleRun: true
    })

    if (process.env.TRAVIS) {
        config.browsers = ['Chrome_travis_ci'];
    }
};