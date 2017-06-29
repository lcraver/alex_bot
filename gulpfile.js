var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var exec        = require('child_process').exec;

var messages = {
    html: '<span style="color: grey">Running:</span> build-html',
    sass: '<span style="color: grey">Running:</span> build-sass'
};

let serverApp;

/**
 * Wait for sass, then launch the Server
 */
gulp.task('browser-sync', ['build-sass'], function() {
    browserSync({
        notify: false,
        port: 3000,
        server: {
            baseDir: 'public',
            middleware: function (req, res, next) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                next();
            }
        },
        ghostMode: false
    });
});

/**
 * Compile files from /sass into both _output/css and /sass
 */
gulp.task('build-sass', function () {
    browserSync.notify(messages.sass);
    gulp.src('public/*.scss')
        .pipe(sass({
            outputStyle: 'compressed',
            //includePaths: ['css'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 2 versions', '> 1%', 'ie 8', 'ie 7', 'ie 9'], { cascade: true }))
        .pipe(gulp.dest('public/css'))
        .pipe(browserSync.stream());
});

gulp.task('server', function () {

    console.log("-- Reload Server --");

    if (serverApp) serverApp.kill();
    serverApp = exec('node server.js', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
    });
})

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch(['db/bot/*.json'], ['server']);
    gulp.watch(['public/*.scss'], ['build-sass']).on('change', browserSync.reload);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['server', 'browser-sync', 'watch']);