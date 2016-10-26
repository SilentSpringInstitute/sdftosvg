#! /usr/bin/env node

var fs = require('fs');
var program = require('commander');
var renderer = require('../index.js');

program
  .version('0.0.1')
  .usage('[options] <input> <output>')
  .option('-w, --width <n>', 'Output width', parseInt)
  .option('-h, --height <n>', 'Output height', parseInt)
  .action(function(input, output, options) {
    inputFile = input;
    outputFile = output;
    width = options.width || 500;
    height = options.height || 500;
  })
  .parse(process.argv);

if(typeof inputFile === 'undefined') {
  console.error('No input file specified.');
  program.help();
}

if(typeof outputFile === 'undefined') {
  console.error('No output file specified.');
  program.help();
}

if(!fs.existsSync(inputFile)) {
  console.error('Input file does not exist.');
  process.exit(1);
}

renderer.renderSdfToSvgFile(inputFile, outputFile, {
  width: width,
  height: height 
});
