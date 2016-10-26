var rewire = require('rewire');
var chai = require('chai');
var should = chai.should();

var mol = rewire('../src/mol.js');

var parseHeader = mol.__get__('parseHeader');
var parseCounts = mol.__get__('parseCounts');
var parseAtoms  = mol.__get__('parseAtoms');
var parseBonds  = mol.__get__('parseBonds');
var parseConnections = mol.__get__('parseConnections');

describe("#parseHeader", function() {
  it("Should extract a mol header", function() {
    var input = ['test'];
    var output = parseHeader(input);

    output.should.eql({ name : 'test' });
  });
});

describe("#parseCounts", function() {
  it("Should extract atom and bond counts", function() {
    var input = " 6  6  0  0  0  0  0  0  0  0  1 V2000";
    var output = parseCounts(input);

    output.should.eql({ atoms: 6, bonds: 6 });
  });
});

describe('#parseAtoms', function() {
  it("Should extract atom positions and types", function() {
    var input = [
      " 1.9050   -0.7932    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0",
      " 1.9050   -2.1232    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0"
    ];

    var output = parseAtoms(input);

    output.should.eql([
      {
        number: 1,
        x: 1.9050,
        y: -0.7932,
        z: 0,
        type: 'C'
      },
      {
        number: 2,
        x: 1.9050,
        y: -2.1232,
        z: 0,
        type: 'C'
      }
    ]);
  });
});

describe('#parseBonds', function() {
  it("Correctly parses bond lines", function() {
    var input = [
      "  2  1  1  0  0  0  0",
      " 3  1  2  0  0  0  0"
    ];

    var output = parseBonds(input);

    output.should.eql([
      { first: 2, second: 1, type: 1 },
      { first: 3, second: 1, type: 2 }
    ]);
  });
});

describe('#parseConnections', function() {
  it("Correctly parses count, atom and bond lines", function() {
    var input = [
      " 6  6  0  0  0  0  0  0  0  0  1 V2000",
      "   1.9050   -0.7932    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0",
      "   1.9050   -2.1232    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0",
      "   0.7531   -0.1282    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0",
      "   0.7531   -2.7882    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0",
      "  -0.3987   -0.7932    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0",
      "  -0.3987   -2.1232    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0",
      " 2  1  1  0  0  0  0",
      " 3  1  2  0  0  0  0",
      " 4  2  2  0  0  0  0",
      " 5  3  1  0  0  0  0",
      " 6  4  1  0  0  0  0",
      " 6  5  2  0  0  0  0",
      "M END",
      "$$$$$"
    ];

    var output = parseConnections(input);

    output.should.have.keys(['atoms', 'bonds']);
    output.atoms.should.have.length(6);
    output.bonds.should.have.length(6);
  });
});
