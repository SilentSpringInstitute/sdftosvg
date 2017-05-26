var _ = require('lodash');
var d3 = require('d3');

/*
 * SVG Helpers
 */
var translate = function(x, y) {
  return "translate(" + x + ", " + y + ") ";
};

var scale = function(x) {
  return "scale(" + x + ") ";
};

var scaleAroundPoint = function(s, x, y) {
  return "translate(" + ((1 - s) * x) + ", " + ((1 - s) * y) + ") scale(" + s + ")";
};

var rotate = function(x) {
  return "rotate(" + x + ") ";
};

var rotateAroundPoint = function(a, x, y) {
  return "rotate(" + a + "," + x + "," + y + ")";
};

var pointPosition = function(a, b, c) {
  return ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) > 0;
};

var render = function(window, molecule, options) {
  var defaultOptions = {
    width: 500,
    height: 500,
    colors: {
      "H": "#FFFFFF",
      "He": "#D9FFFF",
      "Li": "#CC80FF",
      "Be": "#C2FF00",
      "B": "#FFB5B5",
      "C": "#909090",
      "N": "#3050F8",
      "O": "#FF0D0D",
      "F": "#90E050",
      "Ne": "#B3E3F5",
      "Na": "#AB5CF2",
      "Mg": "#8AFF00",
      "Al": "#BFA6A6",
      "Si": "#F0C8A0",
      "P": "#FF8000",
      "S": "#FFFF30",
      "Cl": "#1FF01F",
      "Ar": "#80D1E3",
      "K": "#8F40D4",
      "Ca": "#3DFF00",
      "Sc": "#E6E6E6",
      "Ti": "#BFC2C7",
      "V": "#A6A6Ab",
      "Cr": "#8A99C7",
      "Mn": "#9C7AC7",
      "Fe": "#E06633",
      "Co": "#F090A0",
      "Ni": "#50D050",
      "Cu": "#C88033",
      "Zn": "#7D80B0",
      "Ga": "#C28F8F",
      "Ge": "#668F8F",
      "As": "#BD80E3",
      "Se": "#FFA100",
      "Br": "#A62929",
      "Kr": "#5CB8D1",
      "Rb": "#702EB0",
      "Sr": "#00FF00",
      "Y": "#94FFFF",
      "Zr": "#94E0E0",
      "Nb": "#73C2C9",
      "Mo": "#54B5B5",
      "Tc": "#3B9E9E",
      "Ru": "#248F8F",
      "Rh": "#0A7D8C",
      "Pd": "#006985",
      "Ag": "#C0C0C0",
      "Cd": "#FFD98F",
      "In": "#A67573",
      "Sn": "#668080",
      "Sb": "#9E63B5",
      "Te": "#D47A00",
      "I": "#940094",
      "Xe": "#429EB0",
      "Cs": "#57178F",
      "Ba": "#00C900",
      "La": "#70D4FF",
      "Ce": "#FFFFC7",
      "Pr": "#D9FFC7",
      "Nd": "#C7FFC7",
      "Pm": "#A3FFC7",
      "Sm": "#8FFFC7",
      "Eu": "#71FFC7",
      "Gd": "#45FFC7",
      "Tb": "#30FFC7",
      "Dy": "#1FFFC7",
      "Ho": "#00FF9C",
      "Er": "#00E675",
      "Tm": "#00D452",
      "Yb": "#00BF38",
      "Lu": "#00AB24",
      "Hf": "#4DC2FF",
      "Ta": "#4DA6FF",
      "W": "#2194D6",
      "Re": "#267DAB",
      "Os": "#266696",
      "Ir": "#175487",
      "Pt": "#D0D0E0",
      "Au": "#FFD123",
      "Hg": "#B8B8D0",
      "Tl": "#A6544D",
      "Pb": "#575961",
      "Bi": "#9E4FB5",
      "Po": "#AB5C00",
      "At": "#754F45",
      "Rn": "#428296",
      "Fr": "#420066",
      "Ra": "#007D00",
      "Ac": "#70ABFA",
      "Th": "#00BAFF",
      "Pa": "#00A1FF",
      "U": "#008FFF",
      "Np": "#0080FF",
      "Pu": "#006BFF",
      "Am": "#545CF2",
      "Cm": "#785CE3",
      "Bk": "#8A4FE3",
      "Cf": "#A136D4",
      "Es": "#B31FD4",
      "Fm": "#B31FBA",
      "Md": "#B30DA6",
      "No": "#BD0D87",
      "Lr": "#C70066",
      "Rf": "#CC0059",
      "Db": "#D1004F",
      "Sg": "#D90045",
      "Bh": "#E0038",
      "Hs": "#E6002E",
      "Mt": "#EB0026"
    },
    backgroundColor: '#FFFFFF',
    atomRadius: 8,
    bondStrokeWidth: 3
  };

  options = _.merge(defaultOptions, options);

  var differentSize = options.width != defaultOptions.width || options.height != defaultOptions.height
  var recalcAtomRadius = differentSize && typeof options.atomSize === 'undefined';
  var recalcBondStrokeWidth = differentSize && options.bondStrokeWidth === 'undefined';

  if(recalcAtomRadius) {
    options.atomRadius = Math.round((8 / 500) * Math.min(options.width, options.height));
  }

  if(recalcBondStrokeWidth) {
    options.atomRadius = Math.round((3 / 500) * Math.min(options.width, options.height));
  }

  var xs = _(molecule.connections.atoms).filter(function(d) {
    return d.draw || d.type === "C";
  }).map('x').value();

  var ys = _(molecule.connections.atoms).filter(function(d) {
    return d.draw || d.type === "C";
  }).map('y').value();

  var xExtent = [_.min(xs), _.max(xs)];
  var yExtent = [_.min(ys), _.max(ys)];
  var extent = [_.min(xs.concat(ys)), _.max(xs.concat(ys))];

  var x = d3.scaleLinear().domain(extent).range([0, options.width]);
  var y = d3.scaleLinear().domain(extent).range([options.height, 0]);

  var xAdjust = -(x(_.mean(xExtent)) - options.width / 2);
  var yAdjust = -(y(_.mean(yExtent)) - options.height / 2);

  var svgMain = d3.select(window.document).select('body')
    .append('svg')
    .attr('xmlns', "http://www.w3.org/2000/svg")
    .attr('version', '1.1')
    .attr('width', options.width)
    .attr('height', options.height);

  /*
  svgMain.append('text')
    .text(molecule.header.name)
    .attr('transform', translate(options.width / 2, options.height))
    .style('stroke', 'black')
    .style('font-size', '20pt')
    .style('text-anchor', 'middle').style('baseline', 'bottom');
    */

  svgMain.append('rect')
    .attr('width', options.width)
    .attr('height', options.height)
    .style('fill', options.backgroundColor);

  var svg = svgMain
    .append('g')
    .attr('transform', translate(xAdjust, yAdjust));

  var parentAtom = function(d, which) {
    return molecule.connections.atoms[d3.select(d.parentNode).datum()[which] - 1];
  };

  var getLine = function(that) {
    var line = {
      x1: x(parentAtom(that, 'first').x),
      x2: x(parentAtom(that, 'second').x),
      y1: y(parentAtom(that, 'first').y),
      y2: y(parentAtom(that, 'second').y),
      center: {
        x: _.mean([x(parentAtom(that, 'first').x), x(parentAtom(that, 'second').x)]),
        y: _.mean([y(parentAtom(that, 'first').y), y(parentAtom(that, 'second').y)])
      }
    };
    line.dx = line.x2 - line.x1;
    line.dy = line.y2 - line.y1;
    return line;
  };

  var data = _.filter(molecule.connections.bonds, function(x) { return x.draw; });

  var bondEnter = svg.selectAll('.bond')
    .data(data)
    .enter()
    .append('g')
    .selectAll('line')
    .data(function(d) { return _.range(1, d.type + 1) })
    .enter();

  var bondTransform = function(d) {
    var bond = d3.select(this.parentNode).datum();
    var line = getLine(this);
    var lineCenter = {
      x: _.mean([line.x1, line.x2]),
      y: _.mean([line.y1, line.y2])
    };
    var angle = Math.atan(line.dy / line.dx) * 180 / Math.PI;
    var baseOffset = 3;

    if (bond.type === 1) {
      return "";
    }
    else if (bond.type === 2) {
      if (bond.aromatic === true) {
        switch (d) {
          case 1:
            return "";
          case 2:
            if (Math.abs(Math.abs(angle) - 90) < 1) {
              if (lineCenter.x > x(bond.aromaticCenter.x) && angle > 0) {
                offset = baseOffset * 2;
              }
              else if (lineCenter.x > x(bond.aromaticCenter.x) && angle < 0) {
                offset = -2 * baseOffset;
              }
              else if (lineCenter.x < x(bond.aromaticCenter.x) && angle > 0) {
                offset = -2 * baseOffset;
              }
              else {
                offset = 2 * baseOffset;
              }
            }
            else if (lineCenter.y < y(bond.aromaticCenter.y)) {
              offset = baseOffset * 2;
            }
            else {
              offset = -baseOffset * 2;
            }
            return rotateAroundPoint(angle, lineCenter.x, lineCenter.y) + translate(0, offset) + rotateAroundPoint(-angle, lineCenter.x, lineCenter.y) + scaleAroundPoint(0.8, lineCenter.x, lineCenter.y);
        }
      } else {
        switch (d) {
          case 1:
            return rotate(angle) + translate(0, -baseOffset) + rotate(-angle);
          case 2:
            return rotate(angle) + translate(0, baseOffset) + rotate(-angle);
        }
      }
    } else if (bond.type === 3) {
      switch (d) {
        case 1:
          return rotate(angle) + translate(0, -1.5 * baseOffset) + rotate(-angle);
        case 2:
          return "";
        case 3:
          return rotate(angle) + translate(0, 1.5 * baseOffset) + rotate(-angle);
      }
    }
  };

  bondEnter.append('line')
    .attr('x1', function(d) { return getLine(this).x1; })
    .attr('x2', function(d) { return getLine(this).center.x; })
    .attr('y1', function(d) { return getLine(this).y1; })
    .attr('y2', function(d) { return getLine(this).center.y; })
    .attr('transform', bondTransform)
    .style('stroke', function(d) {
      return options.colors[parentAtom(this, 'first').type];
    })
    .style('stroke-width', options.bondStrokeWidth)
    .style('stroke-linecap', function(d) {
      var bond = d3.select(this.parentNode).datum();
      if (bond.aromatic && d === 1) {
        return "round";
      }
      else {
        return "butt";
      }
    });

  bondEnter.append('line')
    .attr('x1', function(d) { return getLine(this).x2; })
    .attr('x2', function(d) { return getLine(this).center.x; })
    .attr('y1', function(d) { return getLine(this).y2; })
    .attr('y2', function(d) { return getLine(this).center.y; })
    .attr('transform', bondTransform)
    .style('stroke-width', options.bondStrokeWidth)
    .style('stroke', function(d) {
      return options.colors[parentAtom(this, 'second').type];
    });

  svg.selectAll('.atom')
    .data(_.filter(molecule.connections.atoms, function(x) {
      return x.draw;
    }))
    .enter()
    .append('g')
      .attr('class', 'atom')
      .attr('transform', function(d) {
        return translate(x(d.x), y(d.y));
      })
    .append('circle')
      .attr('r', options.atomRadius)
      .style('fill', function(d) {
        return options.colors[d.type];
      });
};

module.exports = render;
