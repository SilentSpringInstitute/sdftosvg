var fs = require('fs');
var should = require('chai').should(),
    renderer = require('../index');

describe("#renderSdfToSvg", function() {
  it("Successfully converts PCB-138 SDF file to SVG", function() {
    var input = fs.readFileSync('./test/examples/pcb-138.sdf', 'utf-8');
    var expected = fs.readFileSync('./test/examples/pcb-138.svg', 'utf-8');

    renderer.renderSdfToSvg(input, {}, function(err, svg) {
      should.not.exist(err);
      svg.should.equal(expected);
    });
  });

});

describe("#renderSdfToSvgFile", function() {
  it("Successfully converts test.sdf to SVG", function(done) {
    renderer.renderSdfToSvgFile('./test/examples/test.sdf', './test/examples/test.svg', function(err, svg) {
        if (err) throw err;
        svg.should.be.a('string');
        done();
    });
  });
});
