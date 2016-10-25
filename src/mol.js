var _ = require('lodash');

var BOND_AROMATIC = 8;

var parseHeader = function(header) {
  var name;
  name = header[0];
  return {
    name: name
  };
};

var parseCounts = function(line) {
  var elements;
  elements = line.replace(/\s+/g, ' ').split(" ");
  return {
    atoms: parseInt(elements[1]),
    bonds: parseInt(elements[2])
  };
};

var parseAtoms = function(lines) {
  return _.map(lines, function(line, index) {
    var elements;
    elements = line.replace(/\s+/g, ' ').split(' ');
    return {
      number: index + 1,
      x: parseFloat(elements[1]),
      y: parseFloat(elements[2]),
      z: parseFloat(elements[3]),
      type: elements[4]
    };
  });
};

var parseBonds = function(lines) {
  return _.filter(lines, function(line) {
    return line.substr(0, 1) !== "M";
  }).map(function(line) {
    var elements;
    elements = line.replace(/\s+/g, ' ').split(' ');
    return {
      first: parseInt(elements[1]),
      second: parseInt(elements[2]),
      type: parseInt(elements[3])
    };
  });
};

var parseConnections = function(lines) {
  var counts;
  counts = parseCounts(lines[0]);
  return {
    atoms: parseAtoms(lines.slice(1, +counts.atoms + 1 || 9e9)),
    bonds: parseBonds(lines.slice(counts.atoms + 1, +(lines.length - 3) + 1 || 9e9))
  };
};

var parsePubChemBondAnnotations = function(lines) {
  return lines.map(function(line) {
    var elements;
    elements = line.replace(/\s+/g, ' ').split(" ");
    return {
      first: parseInt(elements[0]),
      second: parseInt(elements[1]),
      type: parseInt(elements[2])
    };
  });
};

var applyPubChemBondAnnotations = function(molecule, annotations) {
  var annotation, bond, _i, _len, _ref, _results;
  _ref = molecule.connections.bonds;
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    bond = _ref[_i];
    annotation = _.filter(annotations, function(x) {
      return (x.first === bond.first && x.second === bond.second) || (x.first === bond.second && x.second === bond.first);
    });
    if (annotation.length > 0) {
      if (_.map(annotation, 'type').indexOf(BOND_AROMATIC) >= 0) {
        _results.push(bond.aromatic = true);
      } else {
        _results.push(void 0);
      }
    } else {
      _results.push(void 0);
    }
  }
  return _results;
};

var computeAromaticCenters = function(molecule) {
  var bond, centerX, centerY, cycle, cycles, _i, _len, _results;
  cycles = findCycles(molecule);
  _results = [];
  for (_i = 0, _len = cycles.length; _i < _len; _i++) {
    cycle = cycles[_i];
    centerX = _.meanBy(cycle, function(bond) {
      return _.mean([molecule.connections.atoms[bond.first - 1].x, molecule.connections.atoms[bond.second - 1].x]);
    });
    centerY = _.meanBy(cycle, function(bond) {
      return _.mean([molecule.connections.atoms[bond.first - 1].y, molecule.connections.atoms[bond.second - 1].y]);
    });
    _results.push((function() {
      var _j, _len1, _results1;
      _results1 = [];
      for (_j = 0, _len1 = cycle.length; _j < _len1; _j++) {
        bond = cycle[_j];
        bond.aromatic = true;
        molecule.connections.atoms[bond.first - 1].aromatic = true;
        molecule.connections.atoms[bond.second - 1].aromatic = true;
        _results1.push(bond.aromaticCenter = {
          x: centerX,
          y: centerY
        });
      }
      return _results1;
    })());
  }
  return _results;
};

var findCycles = function(molecule) {
  var adjacentCarbonBonds, angleBetweenBonds, bond, carbonBonds, compare, cycle, cycles, direction, dotProductBonds, findNextBond, getAdjacentBonds, getAdjacentCarbonBonds, getAtom, hasBond, isCarbonBond, magBond, nextBond, sideOfPoint, targetAngle, targetSide, temp, _i, _len;
  getAtom = function(number) {
    return molecule.connections.atoms[number - 1];
  };
  isCarbonBond = function(bond) {
    return getAtom(bond.first).type === "C" && getAtom(bond.second).type === "C";
  };
  getAdjacentBonds = function(bond) {
    return _.filter(molecule.connections.bonds, function(x) {
      return (x.first === bond.first || x.first === bond.second || x.second === bond.first || x.second === bond.second) && (x !== bond);
    });
  };
  getAdjacentCarbonBonds = function(bond) {
    return _.filter(getAdjacentBonds(bond), isCarbonBond);
  };
  dotProductBonds = function(bond1, bond2) {
    return (getAtom(bond1.first).x - getAtom(bond1.second).x) * (getAtom(bond2.first).x - getAtom(bond2.second).x) + (getAtom(bond1.first).y - getAtom(bond1.second).y) * (getAtom(bond2.first).y - getAtom(bond2.second).y);
  };
  magBond = function(bond) {
    return Math.sqrt(dotProductBonds(bond, bond));
  };
  angleBetweenBonds = function(bond1, bond2) {
    return Math.acos(dotProductBonds(bond1, bond2) / (magBond(bond1) * magBond(bond2)));
  };
  sideOfPoint = function(bond1, bond2) {
    if (bond1.first === bond2.first || bond1.second === bond2.first) {
      return (getAtom(bond2.second).x - getAtom(bond1.first).x) * (getAtom(bond1.second).y - getAtom(bond1.first).y) - (getAtom(bond2.second).y - getAtom(bond1.first).y) * (getAtom(bond1.second).x - getAtom(bond1.first).x);
    } else {
      return (getAtom(bond2.first).x - getAtom(bond1.first).x) * (getAtom(bond1.second).y - getAtom(bond1.first).y) - (getAtom(bond2.first).y - getAtom(bond1.first).y) * (getAtom(bond1.second).x - getAtom(bond1.first).x);
    }
  };
  compare = function(bond1, bond2) {
    return (bond1.first === bond2.first && bond1.second === bond2.second) || (bond1.first === bond2.second && bond1.second === bond2.first);
  };
  hasBond = function(arr, bond) {
    var b, _i, _len;
    for (_i = 0, _len = arr.length; _i < _len; _i++) {
      b = arr[_i];
      if (compare(b, bond)) {
        return true;
      }
    }
    return false;
  };
  findNextBond = (function(_this) {
    return function(bond1, bonds, targetAngle, targetSide) {
      var angle, bond, side, temp, _i, _len;
      for (_i = 0, _len = bonds.length; _i < _len; _i++) {
        bond = bonds[_i];
        if (bond1.first === bond.first || bond1.second === bond.second) {
          temp = bond.first;
          bond.first = bond.second;
          bond.second = temp;
        }
        angle = angleBetweenBonds(bond1, bond);
        side = sideOfPoint(bond1, bond);
        if (Math.abs(angle - targetAngle) < 2 && (side > 0) === (targetSide > 0)) {
          return bond;
        } else {
          void 0;
        }
      }
    };
  })(this);
  carbonBonds = _.filter(molecule.connections.bonds, isCarbonBond);
  cycles = [];
  while (carbonBonds.length > 0) {
    bond = carbonBonds[0];
    adjacentCarbonBonds = getAdjacentCarbonBonds(bond);
    if (adjacentCarbonBonds.length <= 1) {
      carbonBonds = _.filter(carbonBonds, function(b) {
        return !compare(b, bond);
      });
      continue;
    }
    for (_i = 0, _len = adjacentCarbonBonds.length; _i < _len; _i++) {
      direction = adjacentCarbonBonds[_i];
      if (!hasBond(carbonBonds, bond)) {
        break;
      }
      if (bond.first === direction.first || bond.second === direction.second) {
        temp = direction.first;
        direction.first = direction.second;
        direction.second = temp;
      }
      targetAngle = angleBetweenBonds(bond, direction);
      targetSide = sideOfPoint(bond, direction);
      cycle = [bond, direction];
      while (true) {
        nextBond = findNextBond(direction, _.filter(getAdjacentBonds(direction), function(b) {
          return !hasBond(cycle, b);
        }), targetAngle, targetSide);
        if (nextBond === void 0) {
          break;
        }
        direction = nextBond;
        cycle.push(direction);
      }
      if (cycle.length > 2 && cycle[0].first === cycle[cycle.length - 1].second || cycle[0].second === cycle[cycle.length - 1].first) {
        carbonBonds = _.filter(carbonBonds, function(b) {
          return !hasBond(cycle, b);
        });
        cycles.push(cycle);
      }
    }
    carbonBonds = _.filter(carbonBonds, function(b) {
      return !compare(b, bond);
    });
  }
  return cycles;
};

var identifyAtomsToDraw = function(molecule) {
  var atom, bond, bonds, index, tripleBonds, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _results;
  _ref = molecule.connections.atoms;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    atom = _ref[_i];
    atom.draw = atom.type !== "C" && atom.type !== "H";
  }
  _ref1 = _.filter(molecule.connections.atoms, function(x) {
    return x.type === "H";
  });
  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    atom = _ref1[_j];
    bonds = _.filter(molecule.connections.bonds, function(x) {
      return x.first === atom.number || x.second === atom.number;
    });
    for (_k = 0, _len2 = bonds.length; _k < _len2; _k++) {
      bond = bonds[_k];
      atom.draw = (bond.first === atom.number && molecule.connections.atoms[bond.second - 1].type !== "C") || (bond.second === atom.number && molecule.connections.atoms[bond.first - 1].type !== "C");
    }
  }
  _ref2 = _.filter(molecule.connections.atoms, function(x) {
    return x.type === "C";
  });
  _results = [];
  for (index = _l = 0, _len3 = _ref2.length; _l < _len3; index = ++_l) {
    atom = _ref2[index];
    tripleBonds = _.filter(molecule.connections.bonds, function(x) {
      return (x.first === atom.number || x.second === atom.number) && x.type === 3;
    });
    _results.push(atom.draw = tripleBonds.length > 0);
  }
  return _results;
};

var identifyBondsToDraw = function(molecule) {
  var bond, _i, _len, _ref, _results;
  _ref = molecule.connections.bonds;
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    bond = _ref[_i];
    _results.push(bond.draw = !((molecule.connections.atoms[bond.first - 1].type === "H" && molecule.connections.atoms[bond.second - 1].type === "C") || (molecule.connections.atoms[bond.first - 1].type === "C" && molecule.connections.atoms[bond.second - 1].type === "H")));
  }
  return _results;
};

var parseMol = function(sdf) {
  var mol = sdf.molecules[0].molfile;
  var lines = mol.split("\n");

  var molecule = {};
  molecule.header = parseHeader(lines.slice(0, 3));
  molecule.connections = parseConnections(lines.slice(3, +lines.length + 1 || 9e9));

  if (sdf.molecules[0].PUBCHEM_BONDANNOTATIONS) {
    var annotations = parsePubChemBondAnnotations(sdf.molecules[0].PUBCHEM_BONDANNOTATIONS.split("\n"));
    applyPubChemBondAnnotations(molecule, annotations);
  }

  computeAromaticCenters(molecule);
  identifyAtomsToDraw(molecule);
  identifyBondsToDraw(molecule);
  return molecule;
};

module.exports = parseMol;
