# SDF to SVG

[![Build Status](https://travis-ci.org/SilentSpringInstitute/sdftosvg.svg?branch=master)](https://travis-ci.org/SilentSpringInstitute/sdftosvg)

This is a javascript package for rendering SDF chemical structure files as SVGs.

## Examples
[![HBCDD](https://raw.githubusercontent.com/SilentSpringInstitute/sdftosvg/master/examples/HBCDD.png)](https://pubchem.ncbi.nlm.nih.gov/compound/1_2_5_6_9_10-hexabromocyclododecane)
[![Lindane](https://raw.githubusercontent.com/SilentSpringInstitute/sdftosvg/master/examples/Lind.png)](https://pubchem.ncbi.nlm.nih.gov/compound/727)
[![PFOS](https://raw.githubusercontent.com/SilentSpringInstitute/sdftosvg/master/examples/PFOS.png)](https://pubchem.ncbi.nlm.nih.gov/compound/74483)

## Command Line Usage

```bash
$ sdftosvg ./input.sdf ./output.svg
```

## Usage

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
