module.exports = function(config) {
    config.set({

        basePath: './',

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

        port: 9876,

        logLevel: config.LOG_INFO,

        colors: true,

        autoWatch: true,

        browsers: ['Chrome', 'IE', 'IE10', 'IE9'],

        // For Travis CI
        customLaunchers: {
            Chrome_travis_ci: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            },
            IE10: {
                base: 'IE',
                'x-ua-compatible': 'IE=EmulateIE10'
            },
            IE9: {
                base: 'IE',
                'x-ua-compatible': 'IE=EmulateIE9'
            }
        },

        // Karma plugins loaded
        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-ie-launcher',
            'karma-coverage'
        ],

        // Coverage reporter generates the coverage
        reporters: ['progress', 'dots', 'coverage'],

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

        singleRun: true
    })

    if (process.env.TRAVIS) {
        config.browsers = ['Chrome_travis_ci'];
    }
};