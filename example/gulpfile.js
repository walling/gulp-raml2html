var gulp = require('gulp');
var raml2html = require('gulp-raml2html');

gulp.task('apidoc', function() {
  return gulp.src('./api/api.raml')
    .pipe(raml2html())
    .pipe(gulp.dest('target'));
});
