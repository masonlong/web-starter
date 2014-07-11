/* global require*/
'use strict';

var gulp     = require('gulp'),
    args     = require('yargs').argv,
    gutil    = require('gulp-util'),
    jshint   = require('gulp-jshint'),
    sass     = require('gulp-sass'),
    uglify   = require('gulp-uglify'),
    gulpif   = require('gulp-if'),
    concat   = require('gulp-concat'),
    rename   = require('gulp-rename'),
    prefix   = require('gulp-autoprefixer'),
    imagemin = require('gulp-imagemin'),
    changed  = require('gulp-changed'),
    cache    = require('gulp-cache'),
    size     = require('gulp-size'),
    filter   = require('gulp-cache'),
    flatten  = require('gulp-size'),
    bowerFiles = require('gulp-bower-files'),
    neat     = require('node-neat').includePaths,
    runSequence = require('run-sequence'),
    wiredep = require('wiredep').stream;

var paths = {
    scss: './assets/sass/*.scss',
    js: './assets/js/**/*.js',
    img: './assets/img/**/*',
    fonts: './assets/fonts/**/*'
};

var AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

var isProduction = args.type === 'production';
gutil.log('Environment', gutil.colors.blue(isProduction ? 'Production' : 'Development'));

// Copy Web Fonts To Dist
gulp.task('fonts', function () {
  return gulp.src(paths.fonts)
    .pipe(gulp.dest('app/fonts'))
    .pipe(size({title: 'fonts'}));
});

// Optimize Images
gulp.task('images', function() {
    return gulp.src(paths.img)
        .pipe(cache(imagemin({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true
        })))
    .pipe(gulp.dest('./app/img'))
    .pipe(size({title: 'images'}));
});

// Lint JS
gulp.task('lint', function() {
    return gulp.src(paths.js)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

// Covert/Compress Sass
gulp.task('styles', function() {
    return gulp.src(paths.scss)
        .pipe(changed('./app/css/'))
        .pipe(sass({
            outputStyle: isProduction ? 'compressed' : 'expanded',
            includePaths: ['styles'].concat(neat)
        }))
        .pipe(prefix(AUTOPREFIXER_BROWSERS))
        .pipe(gulpif(isProduction, rename({suffix: '.min'})))
        .pipe(gulp.dest('./app/css'))
        .pipe(size({title: 'styles'}));

});

// Add bower assets to files
gulp.task('bower', function(){
    bowerFiles()
    .pipe(concat('libs.js'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./app/js'))
    .pipe(size({title: 'bower library'}));
});

// Concat/Compress Scripts
gulp.task('scripts', function() {
    return gulp.src(paths.js)
        .pipe(concat('scripts.js'))
        .pipe(gulpif(isProduction, uglify()))
        .pipe(gulpif(isProduction, rename({suffix: '.min'})))
        .pipe(gulp.dest('./app/js'))
        .pipe(size({title: 'scripts'}));
});

// Watch files task
gulp.task('watch', function() {
    gulp.watch(paths.scss, ['styles']);
    gulp.watch(paths.js, ['scripts']);
    gulp.watch('bower.json', ['bower']);
});

// Default Task
gulp.task('default', ['lint'], function (cb) {
    runSequence('styles', ['scripts', 'bower'], cb);
});

