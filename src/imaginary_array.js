var Imaginary = require('./imaginary_header');

Imaginary.addImaginary = (j, j0) => {
  return j + j0;
};

Imaginary.addReal = (j, r) => {
  return [r, j];
};

Imaginary.subImaginary = (j, j0) => {
  return j - j0;
};

Imaginary.subReal = (j, r) => {
  return [0 - r, j];
};

Imaginary.subRealInverse = (j, r) => {
  return [r, 0 - j];
};

Imaginary.subReal = (j, r) => {
  return [0 - r, j];
};

Imaginary.mulImaginary = (j, j0) => {
  return j * j0 * -1;
};

Imaginary.mulReal = (j, r) => {
  return j * r;
};

Imaginary.divImaginary = (j, j0) => {
  var conjugate = 0 - j0;

  // (3i / 4i)
  // (3i*-4i / 4i * -4i)
  // (-12i^2 / -16i^2)
  // (12 / -16)
  var numerator = Imaginary.mulImaginary(j, conjugate);
  var denominator = Imaginary.mulImaginary(j0, conjugate);

  // numerator is real
  // denominator is now real
  return numerator / denominator;
};

Imaginary.divReal = (j, r) => {
  return j / r;
};

// returns imaginary
Imaginary.divRealInverse = (j, r) => {
  var conjugate = 0 - j;

  var numerator = Imaginary.mulReal(conjugate, r);
  var denominator = Imaginary.mulImaginary(conjugate, j);

  // numerator is now imaginary
  // denominator is now real
  return numerator / denominator;
};

module.exports = Imaginary;
