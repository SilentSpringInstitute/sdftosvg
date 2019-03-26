var fs = require('fs');
var parseSdf = require('sdf-parser');
var jsdom = require('jsdom');
var d3 = require('d3');
var _ = require('lodash');

var render = require('./src/renderer');
var parseMol = require('./src/mol.js');

module.exports.renderSdfToSvg = function(sdfRaw, options, cb) {
  try {
    var sdf = parseSdf(sdfRaw);
    var molecule = parseMol(sdf);
  } catch (e) {
    return cb(e);
  }

  jsdom.env({
    html: '<html><body></body></html>',
    features: { QuerySelector: true },
    done: function (errors, window) {
      if (errors) return cb(errors);
      render(window, molecule, options, cb)

      svg = d3.select(window.document).select('body').html()

      if(_.isFunction(cb)) {
        cb(null, svg);
      }
      else if(_.isFunction(options)) {
        options(null, svg);
      }
    }
  });
}

module.exports.renderSdfToSvgFile = function(inputFile, outputFile, options, cb) {
  fs.readFile(inputFile, 'utf-8', function(err, sdfRaw) {
    if (err) return cb(err);
    module.exports.renderSdfToSvg(sdfRaw, options, function(err, svg) {
      if(err) return cb(err);
      fs.writeFile(outputFile, svg, function(err) {
        if(err) return cb(err);

        if(_.isFunction(cb)) {
          return cb(null, svg);
        }
        else if(_.isFunction(options)) {
          options(null, svg);
        }
      });
    });
  });
}
