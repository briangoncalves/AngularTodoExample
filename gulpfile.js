/* Gulp plugin */
var gulp = require('gulp');

/* Javascript plugins */
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');

/* Css plugins */
var csslint = require('gulp-csslint');
var cleanCSS = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');

/* HTML plugins */
var htmllint = require('gulp-htmllint')
var htmlmin = require('gulp-htmlmin');

/* Utility plugins */
var runSequence = require('run-sequence');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var bower = require('gulp-bower');

/* Test plugins */
var http = require('http');
var connect = require('connect');
var serveStatic = require('serve-static');
var selenium = require('selenium-standalone');
var webdriver = require('gulp-webdriver');

var httpServer;
var seleniumServer;

/* Test Tasks */
gulp.task('http', function(cb) {
    var app = connect().use(serveStatic('dist'));
    httpServer = http.createServer(app).listen(9000, cb);
});

gulp.task('selenium', function(cb) {
   selenium.install({logger: console.log}, function() {
       selenium.start(function(err, child) {
            if (err) { return cb(err); }
           seleniumServer = child;
           cb();
       });
   });
});

gulp.task('e2e', ['http', 'selenium'], function() {
  return gulp.src('wdio.conf.js')
    .pipe(webdriver().on('error', function() {
      seleniumServer.kill();
      process.exit(1);
  }));
});

gulp.task('runTest', ['e2e'], function() {
  httpServer.close();
  seleniumServer.kill();
});
/* End Test Tasks */


gulp.task('bower', function() {
  return bower();
});

gulp.task('clean', function () {
    return gulp.src(['dist', 'allure-results', 'allure-report', 'errorShots'], {read: false})
        .pipe(clean());
});

/* HTML Tasks */
gulp.task('htmlmin', function() {
    return gulp.src('app/**/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist/app/'));
});

gulp.task('htmlmin-index', function() {
    return gulp.src('index.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist'));
});

gulp.task('htmllint', function(){
    return gulp.src('src/index.html')
        .pipe(htmllint({}, htmllintReporter));
});

function htmllintReporter(filepath, issues) {
    if (issues.length > 0) {
        issues.forEach(function (issue) {
            gutil.log(gutil.colors.cyan('[gulp-htmllint] ') + gutil.colors.white(filepath + ' [' + issue.line + ',' + issue.column + ']: ') + gutil.colors.red('(' + issue.code + ') ' + issue.msg));
        });
 
        process.exitCode = 1;
    }
}

gulp.task('copyIndex', function() {
   return gulp.src('index.html') 
       .pipe(gulp.dest('dist'));
});

gulp.task('copyAppDev', function() {
   return gulp.src('app/**/*.*')
        .pipe(gulp.dest('dist/app'));
});

gulp.task('copyTemplatesDev', function() {
   return gulp.src('templates/**/*.*') 
        .pipe(gulp.dest('dist/templates'))
});

gulp.task('copyTemplatesProd', function() {
   return gulp.src('templates/**/*.*') 
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist/templates'))
});
/* End HTML Tasks */

/* Javascript Tasks */
gulp.task('vendors', function() {
    return gulp.src(['bower_components/angular/angular.min.js', 'bower_components/angular-route/angular-route.min.js', 'bower_components/jquery/dist/jquery.min.js', 'bower_components/bootstrap/dist/js/bootstrap.min.js'])
        .pipe(concat('vendors.js'))
        .pipe(gulp.dest('dist/js/'));
});

gulp.task('jshint', function () {
    return gulp.src('app/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('uglify', function () {
    return gulp.src('app/**/*.js')
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(gulp.dest('dist/app'));
});
/* End Javascript Tasks */

/* CSS Tasks */
gulp.task('csslint', function () {
    return gulp.src('css/**/*.css')
        .pipe(csslint())
        .pipe(csslint.formatter())
        .pipe(csslint.formatter('fail'));
});

gulp.task('copyCssProd', function() {
   return gulp.src(['bower_components/bootstrap/dist/css/bootstrap.min.css', 'bower_components/bootstrap/dist/css/bootstrap-theme.min.css'])
        .pipe(gulp.dest('dist/css'));
});

gulp.task('copyCssDev', function() {
   return gulp.src(['bower_components/bootstrap/dist/css/bootstrap.css', 'bower_components/bootstrap/dist/css/bootstrap-theme.css', 'css/**/*.css'])
        .pipe(gulp.dest('dist/css'));
});

gulp.task('minify-css', function() {
    return gulp.src('css/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(cleanCSS())
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('cleanBootstrapCssProd', function() {
    return gulp.src(['dist/css/bootstrap.min.css', 'dist/css/bootstrap-theme.min.css'])
        .pipe(clean());
});

gulp.task('bootstrapCssRenameProd', function() {
   return gulp.src('dist/css/bootstrap.min.css')
        .pipe(rename('bootstrap.css'))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('bootstrapThemeCssRenameProd', function() {
   return gulp.src('dist/css/bootstrap-theme.min.css')
        .pipe(rename('bootstrap-theme.css'))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('copyFonts', function() {
   return gulp.src('bower_components/bootstrap/dist/fonts/**/*.*')
        .pipe(gulp.dest('dist/fonts'));
});
/* End CSS Tasks */

/* Runners */
gulp.task('default', function (cb) {
    return runSequence('clean', ['jshint', 'htmllint', 'bower'], ['vendors', 'copyIndex', 'copyAppDev', 'copyCssDev', 'copyFonts', 'copyTemplatesDev'], cb);
});

gulp.task('prod', function (cb) {
    return runSequence('clean', ['jshint', 'htmllint', 'bower'], ['vendors', 'uglify', 'htmlmin', 'htmlmin-index', 'copyCssProd', 'minify-css', 'copyFonts', 'copyTemplatesProd'], ['bootstrapThemeCssRenameProd', 'bootstrapCssRenameProd'], 'cleanBootstrapCssProd', cb);
});

gulp.task('test', function(cb) {
    return runSequence('default', 'runTest', cb);
});
/* End Runners */