const gulp = require('gulp');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');

const files = ['src/**/*.ts', '!src/**/*.spec.ts'];
const outputPath = '../../dist/libs/js-utils';
const tsConfigPath = './tsconfig.build.json';

gulp.task('ts:default', function () {
  return gulp.src(files)
    .pipe(sourcemaps.init())
    .pipe(ts.createProject(tsConfigPath, {
      declaration: true
    })())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(outputPath));
});

gulp.task('ts:commonjs', function () {
  return gulp.src(files)
    .pipe(ts.createProject(tsConfigPath, {
      module: 'commonjs'
    })())
    .pipe(rename({ extname: '.cjs' }))
    .pipe(gulp.dest(outputPath));
});
