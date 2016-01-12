var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var browserSync = require('browser-sync');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
//var spritesmith = require('gulp.spritesmith'); //not implemented, check ch-13 "Automate your workflow"
var nunjucksRender = require('gulp-nunjucks-render');
var del = require('del');
var runSequence = require('run-sequence');

gulp.task('sass', function () {
    return gulp.src('app/scss/**/*.scss')
        // Checks for errors all plugins
        .pipe(customPlumber('Error Running Sass'))
        .pipe(sourcemaps.init())
        .pipe(sass({
            // Includes bower_components as an import location
            includePaths: ['app/bower_components']
        }))
        .pipe(autoprefixer({
            // Example of how to add prefixes to specific versions of browsers ie. IE8 &IE 9
            browsers: ['ie 8-9', 'last 2 versions']
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('watch', function () {
    gulp.watch([
        'app/templates/**/*',
        'app/pages/**/*.+(html|nunjucks)'
    ], ['nunjucks']);
    gulp.watch('app/scss/**/*.scss', ['sass']);
    // Reloads the browser when a JS file is saved
    gulp.watch('app/js/**/*.js', browserSync.reload);
    // Reload the browser when an HTML file is saved
    gulp.watch('app/*.html', browserSync.reload)
});

gulp.task('browserSync', function () {
    browserSync({
        server: {
            baseDir: 'app'
        },
    })
});

gulp.task('nunjucks', function () {
    nunjucksRender.nunjucks.configure(['app/templates'], {watch: false});
    // Gets .html and .nunjucks files in pages
    return gulp.src('app/pages/**/*.+(html|nunjucks)')
        .pipe(customPlumber('Error running nunjuck'))
    // Renders template with nunjucks
        .pipe(nunjucksRender())
        // output files in app folder
        .pipe(gulp.dest('app'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('clean:dev', function (callback) {
    del([
        'app/css',
        'app/*.+(html|nunjucks)'
    ], callback);
});

// Consolidated dev phase task, gathers all dev task into one command
gulp.task('default', function (callback) {
    runSequence(
        'clean:dev',
        //'sprites',
        ['sass', 'nunjucks'],
        ['browserSync', 'watch'],
        callback
    )
});
/*-------------- FUNCTIONS -------------------*/
function customPlumber (errTitle) {
    return plumber({
        errorHandler: notify.onError({
            title: errTitle || "Error running Gulp",
            message: "Error: <%= error.message %>",
            sound: "Submarine"
        })
    });
}