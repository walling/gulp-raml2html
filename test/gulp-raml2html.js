/*jshint node:true,strict:true,undef:true,unused:true*/
/*globals describe:false,it:false*/
'use strict';

var raml2html = require('..');
var stream = require('stream');
var gutil = require('gulp-util');

var File = gutil.File;

describe('gulp-raml2html', function() {

  describe('in streaming mode', function() {

    it('fails with an error (streams are not supported)', function(done) {
      var raml2htmlInstance = raml2html();

      raml2htmlInstance.once('error', function(error) {
        error.message.should.match(/streams are not supported/i);
        done();
      });

      raml2htmlInstance.write(new File({
        contents: new stream.Readable()
      }));
    });

  });

  describe('in buffer mode', function() {

    it('works for simple RAML files', function(done) {
      var raml2htmlInstance = raml2html();

      raml2htmlInstance.on('data', function(file) {
        if (file.path === 'test.html') {
          file.isBuffer().should.equal(true);
          file.contents.toString('utf8').should.match(/<h1>Example API documentation<\/h1>/);
          done();
        }
      });

      raml2htmlInstance.write(new File({
        path: 'test.raml',
        contents: new Buffer('#%RAML 0.8\ntitle: Example')
      }));
    });

    it('emits syntax errors in RAML files', function(done) {
      var raml2htmlInstance = raml2html();

      raml2htmlInstance.once('error', function(error) {
        error.message.should.equal('error.raml:2:1: Parse error while validating root: document must be a map');
        done();
      });

      raml2htmlInstance.write(new File({
        path: 'error.raml',
        contents: new Buffer('#%RAML 0.8\nfail')
      }));
    });

    it('works with JSON input', function(done) {
      var raml2htmlInstance = raml2html({
        supportJsonInput: true
      });

      raml2htmlInstance.on('data', function(file) {
        if (file.path === 'test.html') {
          file.isBuffer().should.equal(true);
          file.contents.toString('utf8').should.match(/<h1>Example API documentation<\/h1>/);
          done();
        }
      });

      raml2htmlInstance.write(new File({
        path: 'test.json',
        contents: new Buffer(JSON.stringify({ title: 'Example' }))
      }));
    });

  });

});
