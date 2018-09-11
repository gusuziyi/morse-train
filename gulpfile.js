var gulp=require('gulp')
var plugins=require('gulp-load-plugins')()
var babel=require('gulp-babel')
gulp.task('less',()=>{
	gulp.src('css/*.less')
	.pipe(plugins.watch('css/*.less'))
	.pipe(plugins.less())
	.pipe(plugins.minifyCss())
	.pipe(plugins.rename({extname:'.min.css'}))
	.pipe(gulp.dest('css'));
	
});

gulp.task('js',()=>{
	gulp.src('js/*.js')
	.pipe(babel())
	.pipe(plugins.browserify({ //浏览器中兼容require等
          insertGlobals : true
        }))
	.pipe(plugins.watch('js/morse.js'))
	.pipe(plugins.uglify())
	.pipe(plugins.rename({extname:'.min.js'}))
	.pipe(gulp.dest('out'));
	
});
gulp.task('default',['less','js']);