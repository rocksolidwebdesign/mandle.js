var test = require('tape');

var Imaginary = require('../src/imaginary_array');

console.log("////////////////////////////////////////////");
console.log("// Testing: ARRAY BASED Imaginary Numbers //");
console.log("////////////////////////////////////////////");
console.log("");

////////////////////////////////////////////////////////////
// Addition
////////////////////////////////////////////////////////////
test('add imaginary', (t) => {
  // 3i + 4i == 7i
  var A = 3;
  var B = 4;

  var expected = 7;
  var actual = Imaginary.addImaginary(A, B);

  t.equal(actual, expected);
  t.end();
});

test('add imaginary commutative', (t) => {
  // 4i + 3i == 3i + 4i
  var A = 3;
  var B = 4;

  var expected = Imaginary.addImaginary(A, B);
  var actual = Imaginary.addImaginary(B, A);

  t.equal(actual, expected);
  t.end();
});

test('add real', (t) => {
  // 3 + 4i == [4, 3i]
  var real = 3;
  var imag = 4;

  var expected = [real, imag];
  var actual = Imaginary.addReal(imag, real);

  t.equal(actual[0], expected[0]);
  t.equal(actual[1], expected[1]);
  t.end();
});

//////////////////////////////////////////////////////////////
//// Subtraction
//////////////////////////////////////////////////////////////
test('subtract Imag', (t) => {
  // 3i - 4i == -1i
  var A = 3;
  var B = 4;

  var expected = -1;
  var actual = Imaginary.subImaginary(A, B);

  t.equal(actual, expected);
  t.end();
});

test('subtract Imag INVERSE', (t) => {
  // 4i - 3i  == 1i
  var A = 3;
  var B = 4;

  var expected = 1;
  var actual = Imaginary.subImaginary(B, A);

  t.equal(actual, expected);
  t.end();
});

test('subtract Real', (t) => {
  // 3i - 4 == [-4, 3i]
  var imag = 3;
  var real = 4;

  var expected = [-4, 3];
  var actual = Imaginary.subReal(imag, real);

  t.equal(actual[0], expected[0]);
  t.equal(actual[1], expected[1]);
  t.end();
});

test('subtract Real INVERSE', (t) => {
  // 4 - 3i == [4, -3i]
  var imag = 3;
  var real = 4;

  var expected = [4, -3];
  var actual = Imaginary.subRealInverse(imag, real);

  t.equal(actual[0], expected[0]);
  t.equal(actual[1], expected[1]);
  t.end();
});

////////////////////////////////////////////////////////////
// Multiplication
////////////////////////////////////////////////////////////
test('multiply Imag', (t) => {
  // 3i * 4i == -12
  var A = 3;
  var B = 4;

  var expected = -12;
  var actual = Imaginary.mulImaginary(A, B);

  t.equal(actual, expected);

  t.end();
});

test('multiply Imag COMMUTATIVE', (t) => {
  var A = 3;
  var B = 4;

  var expected = Imaginary.mulImaginary(A, B);
  var actual = Imaginary.mulImaginary(B, A);

  t.equal(actual, expected);

  t.end();
});

test('multiply Real', (t) => {
  var A = 3;
  var B = 4;

  var expected = 12;
  var actual = Imaginary.mulReal(B, A);

  t.equal(actual, expected);


  t.end();
});

test('multiply Real COMMUTATIVE', (t) => {
  var A = 3;
  var B = 4;

  var expected = Imaginary.mulReal(A, B);
  var actual = Imaginary.mulReal(B, A);

  t.equal(actual, expected);

  t.end();
});

////////////////////////////////////////////////////////////
// Division
////////////////////////////////////////////////////////////
test('divide Imag', (t) => {
  // 3i / 4i == 12 / 16
  var A = 3;
  var B = 4;

  var expected = 12 / 16;
  var actual = Imaginary.divImaginary(A, B);

  t.equal(actual, expected);

  t.end();
});

test('divide Imag INVERSE', (t) => {
  // 4i / 3i == 12 / 9
  var A = 3;
  var B = 4;

  var expected = 12 / 9;
  var actual = Imaginary.divImaginary(B, A);

  t.equal(actual, expected);

  t.end();
});

test('divide Real', (t) => {
  // 3i / 4 == (3 / 4)i
  var A = 3;
  var B = 4;

  var expected = 3 / 4;
  var actual = Imaginary.divReal(A, B);

  t.equal(actual, expected);

  t.end();
});

test('divide Real INVERSE', (t) => {
  // 4 / 3i == (-12 / 9)i
  var A = 3;
  var B = 4;

  var expected = -12 / 9;
  var actual = Imaginary.divRealInverse(A, B);

  t.equal(actual, expected);

  t.end();
});
