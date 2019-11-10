const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const gutil = require('gulp-util');
const ftp = require('vinyl-ftp');
const fs = require('fs');
const sourcemaps = require('gulp-sourcemaps');
const env = fs.readFileSync('.env.json', 'utf8') || null;

let dev = JSON.parse(env);
let settings = {
    localFolder: dev.eventName,
    folder: dev.buildFolder
};

const conn = ftp.create({
    host: dev.dev.host,
    user: dev.dev.user,
    password: dev.dev.password,
    parallel: 10,
    log: gutil.log
});

function build() {
    const globs = [`build/**/*.*`];
    return gulp.src(globs, {base: './build', buffer: false})
        .pipe(conn.dest(settings.folder));
}

function copy() {
    return gulp.src([`./dist/${settings.localFolder}/svg/*.*`, `./dist/${settings.localFolder}/img/*.*`])
        .pipe(gulp.dest(`build/img/${settings.localFolder}`));
}

function scss() {
    return gulp.src('./scss/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(concat('additional.css'))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build/css'))
}

function watch() {
    return gulp.watch('scss/**/*.scss', gulp.series(scss, function(){
        return gulp.src('build/css/*.css', {base: './build', buffer: false})
            .pipe(conn.dest(settings.folder));
    }));
}


gulp.task('build', gulp.series(scss, copy, build));

gulp.task('default', gulp.parallel(watch));
