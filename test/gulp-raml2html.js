/*jshint node:true,strict:true,undef:true,unused:true*/
/*globals describe:false,it:false*/
'use strict';

var raml2html = require('..');
var stream = require('stream');
var gutil = require('gulp-util');
var path = require('path');
var fs = require('fs');

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

    it('supports bigger files', function(done) {
      var raml2htmlInstance = raml2html();

      raml2htmlInstance.on('data', function(file) {
        if (file.path === 'big.html') {
          file.isBuffer().should.equal(true);
          file.contents.toString('utf8').should.match(/can handle big files/i);
          done();
        }
      });

      var bigRamlDoc =
        '#%RAML 0.8\n' +
        'title: Example\n' +
        'documentation:\n' +
        '  - title: Test\n' +
        '    content: |\n' +
        '      More content here. Including **bold** text!';

      while (bigRamlDoc.length < 100 * 1024) {
        bigRamlDoc +=
          ' Here is a lot of text just to\n' +
          '      make the file bigger in order to test for very big files. We need to\n' +
          '      repeat this in order to get more text. We really want the test to show\n' +
          '      that it can handle big files and not fail.';
      }

      raml2htmlInstance.write(new File({
        path: 'big.raml',
        contents: new Buffer(bigRamlDoc)
      }));
    });

    it('can convert an example RAML file', function(done) {
      var raml2htmlInstance = raml2html();

      var ramlPath = path.join(__dirname, 'api', 'example.raml');
      var htmlPath = path.join(__dirname, 'api', 'example.html');
      var ramlContents = fs.readFileSync(ramlPath);
      var htmlContents = fs.readFileSync(htmlPath);

      raml2htmlInstance.on('data', function(file) {
        if (file.path === htmlPath) {
          file.isBuffer().should.equal(true);
          file.contents.toString('utf8').should.equal('' + htmlContents);
          done();
        }
      });

      raml2htmlInstance.write(new File({
        path: ramlPath,
        contents: ramlContents
      }));
    });

    it('can convert an example RAML file in dos line ending', function(done) {
      var raml2htmlInstance = raml2html();

      var ramlDosPath = path.join(__dirname, 'api', 'example.dos.raml');
      var htmlDosPath = path.join(__dirname, 'api', 'example.dos.html');
      var ramlContents = fs.readFileSync(ramlDosPath);
      var htmlContents = fs.readFileSync(path.join(__dirname, 'api', 'example.html'));

      raml2htmlInstance.on('data', function(file) {
        if (file.path === htmlDosPath) {
          file.isBuffer().should.equal(true);
          file.contents.toString('utf8').should.equal('' + htmlContents);
          done();
        }
      });

      raml2htmlInstance.write(new File({
        path: ramlDosPath,
        contents: ramlContents
      }));
    });

  });

});
