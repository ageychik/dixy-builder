const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const gutil = require( 'gulp-util' );
const svgSprite = require("gulp-svg-sprites");
const ftp = require( 'vinyl-ftp' );



let settings = {
    localFolder: 'november',
    folder: 'd.mywfc.ru/local/templates/dixy_2018/',

    svg: (function() {
        return 'img/' + this.localFolder;
    })
};

gulp.task( 'deploy', function () {

    const conn = ftp.create( {
        host:     'd.mywfc.ru',
        user:     'root1',
        password: 'Q8eBVyfb',
        parallel: 10,
        log:      gutil.log
    } );

    const globs = [
        settings.folder + settings.svg() + '/svg/*.svg',
        settings.folder + 'css/additional.css'
    ];

    return gulp.src( globs, { base: '.', buffer: false } )
        .pipe(conn.newer( '/' ))
        .pipe(conn.dest( '/' ));

} );

function sprite(){
    return gulp.src(`svg/${settings.localFolder}/*.svg`)
        .pipe(svgSprite())
        .pipe(gulp.dest(settings.folder + settings.svg()));
}

function scss(){
    return gulp.src('./scss/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(concat('additional.css'))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest(settings.folder + '/css'));
}

gulp.task('build', gulp.series(sprite, scss));