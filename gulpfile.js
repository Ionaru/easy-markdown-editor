'use strict';

var gulp = require('gulp');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var header = require('gulp-header');
var buffer = require('vinyl-buffer');
var pkg = require('./package.json');
var eslint = require('gulp-eslint');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var rename = require('gulp-rename');

var banner = ['/**',
    ' * <%= pkg.name %> v<%= pkg.version %>',
    ' * Copyright <%= pkg.author %>',
    ' * @link <%= pkg.repository.url %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');

gulp.task('lint', function () {
    return gulp.src('./src/js/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

// Browserify easymde.js
gulp.task('build-js', function () {
    return browserify({entries: './src/js/easymde.js', standalone: 'EasyMDE'}).bundle()
        .pipe(source('easymde.js'))
        .pipe(gulp.dest('./dist/'));
});

// Concat CSS files
gulp.task('build-css', function () {
    var css_files = [
        './node_modules/codemirror/lib/codemirror.css',
        './src/css/*.css',
        './node_modules/codemirror-spell-checker/src/css/spell-checker.css'
    ];

    return gulp.src(css_files)
        .pipe(concat('easymde.css'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('minify-js', gulp.series('build-js', function build_js() {
    return gulp.src('./dist/easymde.js')
        .pipe(uglify())
        .pipe(header(banner, {pkg: pkg}))
        .pipe(rename('easymde.min.js'))
        .pipe(gulp.dest('./dist/'));
}));

gulp.task('minify-css', gulp.series('build-css', function minify_css() {
    return gulp.src('./dist/easymde.css')
        .pipe(cleanCSS())
        .pipe(header(banner, {pkg: pkg}))
        .pipe(rename('easymde.min.css'))
        .pipe(gulp.dest('./dist/'));
}));

gulp.task('build', gulp.parallel('build-js', 'build-css'));
gulp.task('minify', gulp.parallel('minify-js', 'minify-css'));
gulp.task('default', gulp.parallel(gulp.series('lint', 'minify-js'), 'minify-css'));
