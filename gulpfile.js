var gulp 			= require('gulp');
var autoprefixer 	= require('gulp-autoprefixer');
var concat 			= require('gulp-concat');
var concat_css 		= require('gulp-concat-css');
var cssretarget 	= require('gulp-cssretarget');
var insert 			= require('gulp-insert');
var minify_css 		= require('gulp-minify-css');
var uglify 			= require('gulp-uglify');

var js_files = [
	'assets/js/Ajax.js',
	'assets/js/Date.js',
	'assets/js/Modal.js',
	'assets/js/Month.js',
	'assets/js/Notification.js',
	'assets/js/Planner.js',
	'assets/js/Week.js',
	'assets/js/main.js'
];

var css_files = [
	'assets/css/animate.css',
	'assets/css/flash.css',
	'assets/css/grid.css',
	'assets/css/header.css',
	'assets/css/modal.css',
	'assets/css/planner.css',
	'assets/css/main.css'
];

// Css task.
gulp.task('css', function() {
	gulp.src(css_files)
	.pipe(concat_css('app.min.css'))
	.pipe(cssretarget())
	.pipe(minify_css({
		keepSpecialComments: '*',
		keepBreaks:false
	}))
	.pipe(gulp.dest(''));
});


// Javascript task.
gulp.task('js', function() {
	gulp.src(js_files)
	.pipe(concat('app.min.js').on('error', function(e){
        console.log(e);
    }))
	.pipe(uglify().on('error', function(e){
        console.log(e);
    }))
	.pipe(gulp.dest('').on('error', function(e){
        console.log(e);
    }));
});


// Watch for changes
// gulp.task('watch', function() {
	// gulp.watch('**/*.less', ['less']);
	//gulp.watch('assets/css/**/*.css', ['css']);
	//gulp.watch('assets/js/**/*.js', ['js']);
// });
