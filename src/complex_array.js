var Complex = require('./complex_header');
var Imaginary = require('./imaginary_array');

Complex.eq = (A, B) => {
  return (
    A[0] === B[0] &&
    A[1] === B[1]
  );
};

////////////////////////////////////////////////////////////
// Addition
////////////////////////////////////////////////////////////
Complex.addReal = (z, r) => {
  return [z[0] + r, z[1]];
};

Complex.addImaginary = (z, j) => {
  return [z[0], Imaginary.addImaginary(z[1], j)];
};

Complex.addComplex = (A, B) => {
  return [A[0] + B[0], Imaginary.addImaginary(A[1], B[1])];
};

////////////////////////////////////////////////////////////
// Subtraction
////////////////////////////////////////////////////////////
Complex.subReal = (z, r) => {
  return [z[0] - r, z[1]];
};

Complex.subRealInverse = (z, r) => {
  return [r - z[0], Imaginary.mulReal(z[1], -1)];
};

Complex.subImaginary = (z, j) => {
  return [z[0], Imaginary.addImaginary(z[1], Imaginary.mulReal(j, -1))];
};

Complex.subImaginaryInverse = (z, j) => {
  return [-1 * z[0], Imaginary.addImaginary(j, Imaginary.mulReal(z[1], -1))];
};

Complex.subComplex = (A, B) => {
  var C = [B[0] * -1, Imaginary.mulReal(B[1], -1)]
  return Complex.addComplex(A, C);
};

////////////////////////////////////////////////////////////
// Multiplication
////////////////////////////////////////////////////////////
Complex.mulReal = (z, r) => {
  return [z[0]*r, Imaginary.mulReal(z[1], r)];
};

Complex.mulImaginary = (z, j) => {
  return [Imaginary.mulImaginary(z[1], j), z[0]*j];
};

Complex.mulComplex = (A, B) => {
  var z1 = Complex.mulReal(B, A[0]);
  var z2 = Complex.mulImaginary(B, A[1]);

  return Complex.addComplex(z1, z2);
};

////////////////////////////////////////////////////////////
// Conjugates
////////////////////////////////////////////////////////////
Complex.getConjugate = (z) => {
  return [z[0], Imaginary.mulReal(z[1], -1)];
};

Complex.getConjugateMultiple = (z) => {
  return Complex.mulComplex(z, Complex.getConjugate(z));
};

Complex.getConjugateSimplified = (z) => {
  var Z = Complex.getConjugateMultiple(z);
  return Z[0];
};

////////////////////////////////////////////////////////////
// Division
////////////////////////////////////////////////////////////
Complex.divReal = (z, r) => {
  return [z[0] / r, Imaginary.divReal(z[1], r)];
};

Complex.divRealInverse = (z, r) => {
  var R = [r, 0];

  return Complex.divComplex(R, z);
};

Complex.divImaginary = (z, j) => {
  return Complex.divComplex(z, [0, j]);
};

Complex.divImaginaryInverse = (z, j) => {
  var I = [0, j];

  return Complex.divComplex(I, z);
};

Complex.divComplex = (A, B) => {
  var C = Complex.getConjugate(B);

  var Z = Complex.mulComplex(A, C);
  var RZ = Complex.mulComplex(B, C);

  var r = RZ[0];

  return [Z[0] / r, Imaginary.divReal(Z[1], r)];
};

module.exports = Complex;
