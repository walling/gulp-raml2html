/*jshint node:true,strict:true,undef:true,unused:true*/
'use strict';

var Mocha = require('mocha');
var chai = require('chai');

var mocha = new Mocha();
mocha.addFile(__dirname + '/gulp-raml2html');

chai.should();
mocha.run();
