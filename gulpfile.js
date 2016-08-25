var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var watchPath = require('gulp-watch-path');
var combiner = require('stream-combiner2');
var sourcemaps = require('gulp-sourcemaps');
var minifycss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var less = require('gulp-less');
//压缩图片，由于公司DNS会压缩图片，所以我们就不做压缩处理
// var imagemin = require('gulp-imagemin');
var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var rename = require('gulp-rename');
var connect = require('gulp-connect'); //livereload

/**
 * 定义编译前路径变量
 * 
 * 定义编译后路径变量
 * cssSrc  指的是less编译前
 * cssSrcDefault  指的是css编译前
 */
var jsSrc = 'src/js/*.js';
var jsDist = 'dist/js';
var cssSrc = 'src/less/*.less';
var cssDist = 'dist/css';
var cssSrcDefault = 'src/css/*.css';
var htmlSrc = 'src/*.html';
var htmlDist = 'dist';

var handleError = function(err) {
    var colors = gutil.colors;
    console.log('\n')
    gutil.log(colors.red('Error!'))
    gutil.log('fileName: ' + colors.red(err.fileName))
    gutil.log('lineNumber: ' + colors.red(err.lineNumber))
    gutil.log('message: ' + err.message)
    gutil.log('plugin: ' + colors.yellow(err.plugin))
}

gulp.task('watchjs', function() {
    gulp.watch('src/js/**/*.js', function(event) {
        var paths = watchPath(event, 'src/', 'dist/')
            
        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        var combined = combiner.obj([
            gulp.src(paths.srcPath),
            sourcemaps.init(),
            uglify(),
            sourcemaps.write('./'),
            gulp.dest(paths.distDir)
        ])

        combined.on('error', handleError)
    })
})

gulp.task('uglifyjs', function() {
    var combined = combiner.obj([
        gulp.src('src/js/**/*.js'),
        sourcemaps.init(),
        uglify(),
        sourcemaps.write('./'),
        gulp.dest('dist/js/')
    ])
    combined.on('error', handleError)
})


gulp.task('watchcss', function() {
    gulp.watch('src/css/**/*.css', function(event) {
        var paths = watchPath(event, 'src/', 'dist/')

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        gulp.src(paths.srcPath)
            .pipe(sourcemaps.init())
            .pipe(autoprefixer({
                browsers: 'last 2 versions'
            }))
            .pipe(minifycss())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(paths.distDir))
    })
})

gulp.task('minifycss', function() {
    gulp.src('src/css/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: 'last 2 versions'
        }))
        .pipe(minifycss())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/css/'))
})

gulp.task('watchless', function() {
    gulp.watch('src/less/**/*.less', function(event) {
        var paths = watchPath(event, 'src/less/', 'dist/css/')

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)
        var combined = combiner.obj([
            gulp.src(paths.srcPath),
            sourcemaps.init(),
            autoprefixer({
                browsers: 'last 2 versions'
            }),
            less(),
            minifycss(),
            sourcemaps.write('./'),
            gulp.dest(paths.distDir)
        ])
        combined.on('error', handleError)
    })
})

gulp.task('lesscss', function() {
    var combined = combiner.obj([
        gulp.src(cssSrc)
        .pipe(gulp.dest(cssDist))
        .pipe(connect.reload()),
        sourcemaps.init(),
        autoprefixer({
            browsers: 'last 2 versions'
        }),
        less(),
        minifycss(),
        sourcemaps.write('./'),


    ])
    combined.on('error', handleError)
})

gulp.task('watchimage', function() {
    gulp.watch('src/img/**/*', function(event) {
        var paths = watchPath(event, 'src/', 'dist/')

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        gulp.src(paths.srcPath)
            /*  压缩图片暂不需要
                *.pipe(imagemin({
                progressive: true
            }))*/
            .pipe(gulp.dest(paths.distDir))
    })
})

gulp.task('image', function() {
    gulp.src('src/img/**/*')
        /*压缩图片暂不需要
            *.pipe(imagemin({
            progressive: true
        }))*/
        .pipe(gulp.dest('dist/img'))
        .pipe(connect.reload())
})

gulp.task('watchcopy', function() {
    gulp.watch('src/fonts/**/*', function(event) {
        var paths = watchPath(event, 'src/', 'dist/')

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        gulp.src(paths.srcPath)
            .pipe(gulp.dest(paths.distDir))
    })
})

gulp.task('copy', function() {
    gulp.src('src/fonts/**/*')
        .pipe(gulp.dest('dist/fonts/'))
})

gulp.task('watchtemplates', function() {
    gulp.watch('src/templates/**/*', function(event) {
        var paths = watchPath(event, 'src/', 'dist/')

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        var combined = combiner.obj([
            gulp.src(paths.srcPath),
            handlebars({
                // 3.0.1
                handlebars: require('handlebars')
            }),
            wrap('Handlebars.template(<%= contents %>)'),
            declare({
                namespace: 'S.templates',
                noRedeclare: true
            }),
            gulp.dest(paths.distDir)
        ])
        combined.on('error', handleError)
    })
})

gulp.task('templates', function() {
    gulp.src('src/templates/**/*')
        .pipe(handlebars({
            // 3.0.1
            handlebars: require('handlebars')
        }))
        .pipe(wrap('Handlebars.template(<%= contents %>)'))
        .pipe(declare({
            namespace: 'S.templates',
            noRedeclare: true
        }))
        .pipe(gulp.dest('dist/templates'))
})


gulp.task('js', function() {
    gulp.src(jsSrc)
        .pipe(gulp.dest(jsDist))
        .pipe(uglify())
        .pipe(connect.reload())
});


gulp.task('html', function() {
    gulp.src(htmlSrc)
        .pipe(gulp.dest(htmlDist))
        .pipe(connect.reload());

});


gulp.task('cssDefault', function() {
    gulp.src(cssSrcDefault)
        .pipe(gulp.dest(cssDist))
        .pipe(connect.reload());

});

//定义livereload任务
gulp.task('connect', function() {
    connect.server({
        livereload: true
    });
});


//定义看守任务
gulp.task('watch', function() {

    gulp.watch('src/*.html', ['html']);

    gulp.watch('src/js/*.js', ['js']);
    gulp.watch('src/less/*.less', ['lesscss']);
    gulp.watch('src/css/*.css', ['cssDefault']);
    gulp.watch('src/img/*', ['image']);


});

/**
 * 运行的时候直接 gulp 即可运行 
 * 地址为Localhost:8080
 */

gulp.task('default', ['watchjs', 'watchcss', 'watchless',  'watchimage', 'watchcopy', 'watchtemplates', 'html', 'js', 'connect', 'lesscss', 'cssDefault', 'watch', 'image'])