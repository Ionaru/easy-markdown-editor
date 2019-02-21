/* tslint:disable:no-implicit-dependencies no-var-requires */
import * as gulp from 'gulp';
import * as ts from 'gulp-typescript';
import * as uglify from 'gulp-uglify';
import * as typescript from 'typescript';
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const header = require('gulp-header');
const buffer = require('vinyl-buffer');
const pkg = require('./package.json');
const eslint = require('gulp-eslint');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const rename = require('gulp-rename');

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

function buildBrowserModule() {
    return browserify(['build/newmde.js'], {standalone: 'NewMDE', extensions: 'common-shakeify'})
        .bundle()
        .pipe(source('newmde.min.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(header(banner, {pkg}))
        .pipe(gulp.dest('dist'));
}

const buildScripts = gulp.series(compileTypescript, buildBrowserModule);

gulp.task('lint', lintJavascript);
gulp.task('styles', buildStyles);
gulp.task('scripts', buildScripts);
gulp.task('default', gulp.parallel(buildStyles, buildScripts));
