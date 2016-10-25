var render = require('./renderer');
var fs = require('fs');
var parseSdf = require('sdf-parser');
var parseMol = require('./mol.js');
var jsdom = require('jsdom');
var d3 = require('d3');

module.exports.renderSdfToSvg = function(sdfRaw, options, callback) {
  var sdf = parseSdf(sdfRaw);
  var molecule = parseMol(sdf);

  jsdom.env({
    html: '<html><body></body></html>',
    features: { QuerySelector: true },
    done: function (errors, window) {
      render(window, molecule, options)

      svg = d3.select(window.document).select('body').html()
      
      callback(svg);
    }
  });
}

module.exports.renderSdfToSvgFile = function(inputFile, outputFile, options) {
  fs.readFile(inputFile, 'utf-8', function(err, sdfRaw) {
    if(err) throw err;
    module.exports.renderSdfToSvg(sdfRaw, options, function(svg) {
      fs.writeFile(outputFile, svg, function(err) {
        if(err) throw err; 
      });
    });
  }); 
}
