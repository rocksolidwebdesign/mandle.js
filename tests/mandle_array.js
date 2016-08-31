var test = require('tape');

var Imaginary = require('../src/imaginary_array');
var Complex = require('../src/complex_array');
var Mandle = require('../src/mandle');

test('mandlebrot 100', (t) => {
  var num_pixels = 100;
  var M = Mandle.get_mandlebrot_matrix(num_pixels);
  var out = Mandle.get_mandlebrot_ascii(M, num_pixels);

  console.log(out);

  t.ok(true);
  t.end();
});

test('mandlebrot 50', (t) => {
  var num_pixels = 50;
  var M = Mandle.get_mandlebrot_matrix(num_pixels);
  var out = Mandle.get_mandlebrot_ascii(M, num_pixels);

  console.log(out);

  t.ok(true);
  t.end();
});
