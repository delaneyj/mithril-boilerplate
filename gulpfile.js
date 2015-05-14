var fs = require('fs'),
    gulp = require('gulp'),
    debug = require('gulp-debug'),
    newer = require('gulp-newer'),
    nodemon = require('gulp-nodemon'),
    gulpWebpack = require('gulp-webpack'),
    gulpSequence = require('gulp-sequence'),
    webpack = require('webpack'),
    del = require('del'),
    browserSync = require('browser-sync'),
    BROWSER_SYNC_RELOAD_DELAY = 500, // we'd need a slight delay to reload browsers connected to browser-sync after restarting nodemon
    config = require('./config');

gulp.task('nodemon', ['backend','frontend'], function (callback) {
    var called = false;
    return nodemon({

        // nodemon our expressjs server
        script: 'build/server.js',

        // watch core server file(s) that require server restart on change
        watch: ['build/server.js']
    })
        .on('start', function onStart() {
            // ensure start only got called once
            if (!called) callback();
            called = true;
        })
        .on('restart', function onRestart() {
            // reload connected browsers after a slight delay
            setTimeout(function reload() {
                browserSync.reload({
                    stream: false   //
                });
            }, BROWSER_SYNC_RELOAD_DELAY);
        });
});

gulp.task('html', function(){
    gulp.src('source/frontend/html/*')
        .pipe(newer('build/public'))
        .pipe(debug({title: 'Copying modified HTML:'}))
        .pipe(gulp.dest('build/public'));
});

gulp.task('frontend',['html'], function(){
    var config = {
        output:{
            filename:'bundle.js'
        },
        module: {
            loaders: [
                { test: /\.js$/, loader: 'babel?stage=1'},
                { test: /\.styl$/, loader: 'style!css!stylus' }
            ]
        },
        plugins:[
            new webpack.NoErrorsPlugin()
        ],
        devtool:'source-map'
    };

    return gulp.
        src('source/frontend/js/main.js').
        pipe(gulpWebpack(config)).
        pipe(gulp.dest('build/public'));
});

gulp.task('backend',function(){
    var nodeModules = {};
    fs.readdirSync('node_modules')
        .filter(function(x) {
            return ['.bin'].indexOf(x) === -1;
        })
        .forEach(function(mod) {
            nodeModules[mod] = 'commonjs ' + mod;
        });

    var config = {
        target: 'node',
        externals: nodeModules,
        output:{ filename:'server.js' },
        module: { loaders: [ { test: /\.js$/, loader: 'babel?stage=1'} ]},
        plugins:[ new webpack.NoErrorsPlugin() ],
        devtool:'source-map'
    };

    return gulp.
        src('source/backend/main.js').
        pipe(gulpWebpack(config)).
        pipe(gulp.dest('build'));
});

gulp.task('browser-sync', ['nodemon'], function () {
    browserSync.init({ // for more browser-sync config options: http://www.browsersync.io/docs/options/
        files: ['build/public/**/*.*'], // watch the following files; changes will be injected (css & images) or cause browser to refresh
        proxy: 'http://localhost:' + config.DEVLOPEMENT_PORT, // informs browser-sync to proxy our expressjs app which would run at the following location
        port: 4000, // informs browser-sync to use the following port for the proxied app notice that the default port is 3000, which would clash with our expressjs
        browser: ['google chrome'] // open the proxied app in chrome
    });

    gulp.watch('source/backend/**/*', ['backend']);
    gulp.watch('source/frontend/**/*', ['frontend']);
});

gulp.task('clean', function(cb) {
    del(['build'], cb);
});

gulp.task('default', gulpSequence('clean','browser-sync'));