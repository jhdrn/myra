// Tun on full stack traces in errors to help debugging
Error.stackTraceLimit = Infinity;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

// // Cancel Karma's synchronous start,
// // we will call `__karma__.start()` later, once all the specs are loaded.
__karma__.loaded = function () { };

System.config({
    packages: {
        'base/build': {
            defaultExtension: 'js',
            format: 'cjs',
            map: {
                'core': './src/core/index',
                'core/component': './src/core/component',
                'core/contract': './src/core/contract',
                'core/dispatch': './src/core/dispatch',
                'core/task': './src/core/task',
                'core/helpers': './src/core/helpers',
                'core/subscriptions': './src/core/subscriptions',
                'core/validation': './src/core/validation',
                'core/view': './src/core/view',
                'core/jsxFactory': './src/core/jsxFactory',
                'http': './src/http',
                'time': './src/time'
            }
        }
    }
});

System.import('base/build/src/core/index')
    .then(function () {
        return Promise.all(resolveTestFiles());
    })
    .then(function () {
        __karma__.start();
    }, function (error) {
        __karma__.error(error.stack || error.message);
    });

function onlySpecFiles(path) {
    return /\.spec\.js$/.test(path);
}

function resolveTestFiles() {
    return Object.keys(window.__karma__.files) // All files served by Karma.
        .filter(onlySpecFiles)
        .map(function (moduleName) {
            // loads all spec files via their global module names (e.g.
            // 'base/dist/vg-player/vg-player.spec')
            return System.import(moduleName);
        });
}
