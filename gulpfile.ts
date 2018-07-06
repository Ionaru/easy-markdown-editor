// import * as fs from 'fs';
import * as gulp from 'gulp';
import * as ts from 'gulp-typescript';
import * as uglify from 'gulp-uglify';
import * as typescript from 'typescript';
// import SimpleMDE from './src2/simplemde2';
// import * as browserify from 'gulp'
// import * as cleanCSS from 'gulp-clean-css';
// import * as header from 'gulp-header';
// import * as rename from 'gulp-rename';
// import * as browserify from 'browserify';

// var gulp = require('gulp'),
const cleanCSS = require('gulp-clean-css');
// uglify = require('gulp-uglify'),
const concat = require('gulp-concat'),
    header = require('gulp-header'),
    buffer = require('vinyl-buffer'),
    pkg = require('./package.json'),
    eslint = require('gulp-eslint'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    rename = require('gulp-rename');

const banner = ['/**',
    ' * <%= pkg.name %> v<%= pkg.version %>',
    ' * Copyright <%= pkg.author %>',
    ' * @link <%= pkg.repository.url %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');

function lintJavascript() {
    gulp.src('./src/js/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}

gulp.task('lint', lintJavascript);

function buildJavascript() {
    return browserify({entries: './src/js/easymde.js', standalone: 'EasyMDE'}).bundle()
        .pipe(source('easymde.min.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(header(banner, {pkg}))
        .pipe(gulp.dest('dist'));
}

gulp.task('scripts', gulp.series(lintJavascript, buildJavascript));

function buildStyles() {
    const cssFiles = [
        './node_modules/codemirror/lib/codemirror.css',
        './src/css/*.css',
        './node_modules/codemirror-spell-checker/src/css/spell-checker.css',
    ];

    return gulp.src(cssFiles)
        .pipe(concat('easymde.css'))
        .pipe(cleanCSS())
        .pipe(rename('easymde.min.css'))
        .pipe(buffer())
        .pipe(header(banner, {pkg}))
        .pipe(gulp.dest('dist'));
}

gulp.task('styles', buildStyles);

gulp.task('default', gulp.parallel(buildStyles, buildJavascript));

function compileTypescript() {
    let failed = false;
    const tsProject = ts.createProject('tsconfig.json', {typescript});
    return gulp.src('src/ts/**/*.ts')
        .pipe(tsProject())
        .on('error', () => {
            failed = true;
        })
        .on('finish', () => {
            if (failed) {
                process.exit(1);
            }
        })
        .pipe(gulp.dest('build'));
}

function buildTypescript() {
    return browserify(['build/newmde.js'], {standalone: 'NewMDE'})
    // return browserify(['build/index.js'], {standalone: 'Test'})
    // return browserify(['build/test.js'], {standalone: 'Test'})
    // .plugin('tsify', {project: 'tsconfig.json'})
        .bundle()
        .pipe(source('newmde.min.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(header(banner, {pkg}))
        .pipe(gulp.dest('dist'));
}

gulp.task('build', gulp.series(compileTypescript, buildTypescript));
// return browserify({entries: './src/js/easymde.js', standalone: 'EasyMDE'}).bundle()
//     .pipe(source('easymde.min.js'))
//     .pipe(buffer())
//     .pipe(uglify())
//     .pipe(header(banner, {pkg}))
//     .pipe(gulp.dest('./dist/'));
