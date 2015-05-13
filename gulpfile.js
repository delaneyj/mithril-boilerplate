var path = require('path'),
    gulp = require('gulp'),
    webpack = require('webpack'),
    gulpWebpack = require('gulp-webpack'),
    browserSync = require('browser-sync');

gulp.task('frontend-build', ['html'], function(){
    var config = {
        output:{
            filename:'bundle.js'
        },
        module: {
            loaders: [
                { test: /\.js$/, loader: 'babel?stage=1'},
                { test: /\.styl$/, loader: 'style!css!stylus?paths=node_modules/axis' }
            ]
        },
        plugins:[
            new webpack.NoErrorsPlugin()
        ],
        devtool:'eval'
    };

    return gulp.
        src('./source/frontend/js/main.js').
        pipe(gulpWebpack(config)).
        pipe(gulp.dest('./build/frontend/'));
});

gulp.task('frontend-watch',['frontend-build'], browserSync.reload);

gulp.task('html', function(){
    return gulp.src('./source/frontend/html/*').
        pipe(gulp.dest('./build/frontend'));
});

gulp.task('watch', function() {
    browserSync.init({
        server: {
            baseDir: './build/frontend/'
        }
    });

    gulp.watch(['./source/frontend/**/*'], ['frontend-watch']);
});

gulp.task('default',['watch']);