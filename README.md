# SDF to SVG

[![Build Status](https://travis-ci.org/SilentSpringInstitute/sdftosvg.svg?branch=master)](https://travis-ci.org/SilentSpringInstitute/sdftosvg)

This is a javascript package for rendering SDF chemical structure files as SVGs.

`sdftosvg` is built with PubChem SDF files in mind, because PubChem includes extra helpful annotations in their structure files.

## Examples
[![HBCDD](https://raw.githubusercontent.com/SilentSpringInstitute/sdftosvg/master/examples/HBCDD.png)](https://pubchem.ncbi.nlm.nih.gov/compound/1_2_5_6_9_10-hexabromocyclododecane)
[![Lindane](https://raw.githubusercontent.com/SilentSpringInstitute/sdftosvg/master/examples/Lind.png)](https://pubchem.ncbi.nlm.nih.gov/compound/727)
[![PFOS](https://raw.githubusercontent.com/SilentSpringInstitute/sdftosvg/master/examples/PFOS.png)](https://pubchem.ncbi.nlm.nih.gov/compound/74483)

## Command Line Usage

```bash
$ sdftosvg ./input.sdf ./output.svg
```

## Command Line Arguments
```
Usage: convert [options] <input> <output>

  Options:

    -h, --help        output usage information
    -V, --version     output the version number
    -w, --width <n>   Output width
    -h, --height <n>  Output height
```

## NPM Package Usage

```js
var renderer = require('sdftosvg');

// Convert SDF as string to SVG
var fs = require('fs');
var sdf = fs.readFileSync('./pcb-138.sdf');
renderer.renderSdfToSvg(sdf, {}, function(svg) {
  console.log(svg);
});

// Convert SDF file to SVG file
renderer.renderSdfToSvgFile('./pcb-138.sdf', './pcb-138.svg');
```

### Methods

`renderSdfToSvg(sdf, options, callback)`

Renders an SDF string to an SVG string.

- `sdf`: string containing SDF file contents
- `options`: options object, defined below
- `callback`: function called after rendering that is given output SVG as a string

`renderSdfToSvgFile(inputFile, outputFile, options)`

Renders an SDF file to an SVG file.

- `inputFile`: path to input SDF file
- `outputFile`: path to save output SVG file
- `options`: options object, defined below

### Options
The options object can contain the following keys:

- `width`: output width, in pixels
- `height`: output height, in pixels
- `atomRadius`: radius of atom circles
- `bondStrokeWidth`: stroke width of bond lines
- `colors`: object mapping chemical abbreviations to colors, for example:

  ```js
  {
    "C": "red",
    "O", "blue",
    "H", "green"
  }
  ```

## Todo
A number of features remain to be added:
- Allow specifying custom color scheme on the command line.
- Allow further customization of output
