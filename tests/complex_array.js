var test = require('tape');

var Imaginary = require('../src/imaginary_array');
var Complex = require('../src/complex_array');

console.log("////////////////////////////////////////////");
console.log("// Testing: ARRAY BASED Complex Numbers //");
console.log("////////////////////////////////////////////");

////////////////////////////////////////////////////////////
// Addition
////////////////////////////////////////////////////////////
test('complex_add_real', (t) => {
  var A = [1.0, 2.0];
  var B = 3.0;

  var expected = [4.0, 2.0];
  var actual = Complex.addReal(A, B);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

test('complex_add_imaginary', (t) => {
  var A = [1.0, 2.0];
  var B = 3.0;

  var expected = [1.0, 5.0];
  var actual = Complex.addImaginary(A, B);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

test('complex_add_complex', (t) => {
  var A = [1.0, 2.0];
  var B = [2.0, 3.0];

  var expected = [3.0, 5.0];
  var actual = Complex.addComplex(A, B);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

test('complex_add_complex_commutative', (t) => {
  var A = [1.0, 2.0];
  var B = [2.0, 3.0];

  var expected = Complex.addComplex(A, B);
  var actual = Complex.addComplex(B, A);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

////////////////////////////////////////////////////////////
// Subtraction
////////////////////////////////////////////////////////////
test('complex_subtract_real', (t) => {
  var A = [1.0, 2.0];
  var B = 3.0;

  var expected = [-2.0, 2.0];
  var actual = Complex.subReal(A, B);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

test('complex_subtract_real_inverse', (t) => {
  var A = [1.0, 2.0];
  var B = 3.0;

  var expected = [2.0, -2.0];
  var actual = Complex.subRealInverse(A, B);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

test('complex_subtract_imaginary', (t) => {
  var A = [1.0, 2.0];
  var B = 3.0;

  var expected = [1.0, -1.0];
  var actual = Complex.subImaginary(A, B);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

test('complex_subtract_imaginary_inverse', (t) => {
  var A = [1.0, 2.0];
  var B = 3.0;

  var expected = [-1.0, 1.0];
  var actual = Complex.subImaginaryInverse(A, B);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

test('complex_subtract_complex', (t) => {
  var A = [1.0, 2.0];
  var B = [2.0, 3.0];

  var expected = [-1.0, -1.0];
  var actual = Complex.subComplex(A, B);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

test('complex_subtract_complex_inverse', (t) => {
  var A = [1.0, 2.0];
  var B = [2.0, 3.0];

  var expected = [1.0, 1.0];
  var actual = Complex.subComplex(B, A);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

////////////////////////////////////////////////////////////
// Multiplication
////////////////////////////////////////////////////////////
test('complex_multiply_real', (t) => {
  var A = [1.0, 2.0];
  var B = 3.0;

  var expected = [3.0, 6.0];
  var actual = Complex.mulReal(A, B);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

test('complex_multiply_imaginary', (t) => {
  var A = [1.0, 2.0];
  var B = 3.0;

  var expected = [-6.0, 3.0];
  var actual = Complex.mulImaginary(A, B);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

test('complex_multiply_complex', (t) => {
  var A = [3.0, 2.0];
  var B = [4.0, 7.0];

  var expected = [-2.0, 29.0];
  var actual = Complex.mulComplex(A, B);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

test('complex_multiply_complex_commutative', (t) => {
  var A = [3.0, 2.0];
  var B = [4.0, 7.0];

  var expected = Complex.mulComplex(A, B);
  var actual = Complex.mulComplex(B, A);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

////////////////////////////////////////////////////////////
// Conjugates
////////////////////////////////////////////////////////////
test('complex_conjugate', (t) => {
  var A = [2.0, 5.0];

  var expected = [2.0, -5.0];
  var actual = Complex.getConjugate(A);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

test('complex_conjugate_multiple', (t) => {
  var A = [2.0, 5.0];

  var expected = [29.0, 0.0];
  var actual = Complex.getConjugateMultiple(A);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

test('complex_conjugate_simplified', (t) => {
  var A = [2.0, 5.0];

  var expected = 29.0;
  var actual = Complex.getConjugateSimplified(A);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

////////////////////////////////////////////////////////////
// Division
////////////////////////////////////////////////////////////
test('complex_divide_real', (t) => {
  var A = [6.0, 8.0];
  var B = 2.0;

  var expected = [3.0, 4.0];
  var actual = Complex.divReal(A, B);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

test('complex_divide_real_inverse', (t) => {
  // 2 / (3 + 4i)
  // (2 + 0i) / (3 + 4i)
  // (2 + 0i) (3 - 4i) / (3 + 4i) (3 - 4i)
  // (6 + -8i) / (3^2 + -4*4*i*i)
  // (6 + -8i) / (3^2 + -4*4*-1)
  // (6 + -8i) / (3^2 + 4*4)
  // (6 + -8i) / (9 + 16)
  // (6 + -8i) / (25)

  var A = [3.0, 4.0];
  var B = 2.0;

  var expected = [6.0 / 25.0, -8.0 / 25.0];
  var actual = Complex.divRealInverse(A, B);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

test('complex_divide_imaginary', (t) => {
  // (5 + 4i) / (0 + 3i)
  // (5 + 4i) * (0 - 3i) / (0 + 3i) (0 - 3i)
  // (5 + 4i) * (0 - 3i) / -3*3*i*i
  // (5 + 4i) * (0 - 3i) / 3*3
  // (5 + 4i) * (0 - 3i) / 9
  // (5*0 + 5*-3i + 4i*0 + 4i*-3i) / 9
  // (5*0 + 5*-3i + 4i*0 + 4*-3*i*i) / 9
  // (5*0 + 5*-3i + 0i + 4*-3*i*i) / 9
  // (0 + 5*-3i + 0i + 4*-3*i*i) / 9
  // (0 + -15i + 0i + 4*-3*i*i) / 9
  // (0 + -15i + 0i + -12*i*i) / 9
  // (0 + -15i + 0i + 12) / 9
  // (12 + -15i) / 9

  var A = [5.0, 4.0];
  var B = 3.0;

  var expected = [12.0 / 9.0, -15.0 / 9.0];
  var actual = Complex.divImaginary(A, B);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

test('complex_divide_imaginary_inverse', (t) => {
  // 2i / (3 + 4i)
  // 0 + 2i / (3 + 4i)
  // (0 + 2i) (3 - 4i) / (3 + 4i) (3 - 4i)
  // (0*3 + 0*-4i + 2i*3 + 2i*-4i) / (3 + 4i) (3 - 4i)
  // (0*3 + 0*-4i + 2i*3 + 2i*-4i) / (3^2 + -4*4*i*i)
  // (2i*3 + 2i*-4i) / (3^2 + -4*4*i*i)
  // (2i*3 + -1*2*4*i*i) / (3^2 + -1*4*4*i*i)
  // (2i*3 + 2*4) / (3^2 + 4*4)
  // (2i*3 + 2*4) / 25
  // (6i + 8) / 25
  // (8 + 6i) / 25

  var A = [3.0, 4.0];
  var B = 2.0;

  var expected = [8.0 / 25.0, 6.0 / 25.0];
  var actual = Complex.divImaginaryInverse(A, B);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

test('complex_divide_complex', (t) => {
  // (5 + 4i) / (3 + 2i)
  // (5 + 4i)         (3 - 2i)
  // ==========   *   ========
  // (3 + 2i)         (3 - 2i)
  //
  // (5 + 4i)         (3 - 2i)
  // ==========   *   ========
  // (9 + 4)

  // (5*3 + 5*-2i + 4i*3 + 4i*-2i)
  // ==========
  // (13)

  // (15 + -10i + 12i + 8)
  // ==========
  // (13)

  // (15 + 8 + 12i + -10i)
  // ==========
  // (13)

  // (23 + 2i)
  // ==========
  // (13)
  var A = [5.0, 4.0];
  var B = [3.0, 2.0];

  var expected = [23.0 / 13.0, 2.0 / 13.0];
  var actual = Complex.divComplex(A, B);

  t.ok(Complex.eq(expected, actual));
  t.end();
});

test('complex_divide_complex_inverse', (t) => {
  // (3 + 2i) / (5 + 4i)
  //
  // (3 + 2i)         (5 - 4i)
  // ========     *   ========
  // (5 + 4i)         (5 - 4i)
  //
  // (3 + 2i)         (5 - 4i)
  // ========     *   ========
  // (5*5 + 4*-4*i*)
  //
  // (3*5 + 3*-4i + 2i*5 + 2i*-4i)
  // ========
  // (5*5 + 4*-4*i*i)
  //
  // (3*5 + -3*4i + 2i*5 + -2*4*i*i)
  // ========
  // (5*5 + -4*4*i*i)
  //
  // (15 + -12i + 10i + 8)
  // ========
  // (25 + 16)
  //
  // (15 + 8 + -12i + 10i)
  // ========
  // (41)
  //
  // (23 + -2i)
  // ========
  // (41)

  var A = [5.0, 4.0];
  var B = [3.0, 2.0];

  var expected = [23.0 / 41.0, -2.0 / 41.0];
  var actual = Complex.divComplex(B, A);

  t.ok(Complex.eq(expected, actual));
  t.end();
});
