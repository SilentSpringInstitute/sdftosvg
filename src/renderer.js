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
      "Cl": "#2ecc71",
      "S": "#3498db",
      "F": "#8e44ad",
      "O": "#e74c3c",
      "N": "#2980b9",
      "H": "#7f8c8d",
      "C": "#2c3e50",
      "Br": "brown",
      "P": "#d35400"
    }
  };

  options = _.merge(defaultOptions, options);

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
    .attr('width', options.width)
    .attr('height', options.height);

  svgMain.append('text')
    .text(molecule.header.name)
    .attr('transform', translate(options.width / 2, options.height))
    .style('stroke', 'black')
    .style('font-size', '20pt')
    .style('text-anchor', 'middle').style('baseline', 'bottom');

  var svg = svgMain
    .append('g')
    .attr('transform', translate(xAdjust, yAdjust));

  var parentAtom = function(d, which) {
    return molecule.connections.atoms[d3.select(d.parentNode).datum()[which] - 1];
  };

  getLine = function(that) {
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
    .data(function(d) { return _.range(1, d.type) })
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
    }).style('stroke-width', 3).style('stroke-linecap', function(d) {
      var bond;
      bond = d3.select(this.parentNode).datum();
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
    .style('stroke-width', 3)
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
      .attr('r', 8)
      .style('fill', function(d) {
        return options.colors[d.type];
      });
};

module.exports = render;
