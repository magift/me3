var gulp = require('gulp'),

	compass = require('gulp-compass'),
	minifyCSS = require('gulp-minify-css'),
	refresh = require('gulp-livereload'),
	lr = require('tiny-lr'),
	server = lr();
	

// CSS 
gulp.task('style', function(){
	return gulp.src(['src/css/**/*.scss'])		
		.pipe(compass({
			css: 'css',
			sass: 'src/css',
			image: 'img'
		}))
		.pipe(minifyCSS())
		.pipe(refresh(server));

});


// html
gulp.task('html', function(){
	return gulp.src(['*.html', 'js/**/*.js', 'img/**'])		
		.pipe(refresh(server));

});

gulp.task('livereload', function(){
	server.listen(35726, function(err){
		if(err) return console.log(err);
	});
});

// 默认任务

gulp.task('default', function(){
	gulp.run('livereload', 'style', 'html');
	gulp.watch([
		'src/css/**/*.*',
		'img/**'
		], function(event){
			gulp.run('style');	
		}
	);
	gulp.watch([
		'*.html',
		'js/**/*.js',
		'img/**'
		], function(event){
			gulp.run('html');	
		}
	);	

});
