function Imaginary(c) {
  this.coefficient = x;
}

Imaginary.prototype = {
  add_r: (r) => 0.0,
  add_i: (j) => 0.0,
  sub_r: (r) => 0.0,
  sub_i: (j) => 0.0,
  mul_r: (r) => 0.0,
  mul_i: (j) => 0.0,
  div_r: (r) => 0.0,
  div_i: (j) => 0.0,

  eq: (j) => 0.0,
  neq: (j) => 0.0,
  gt: (j) => 0.0,
  lt: (j) => 0.0,
  gte: (j) => 0.0,
  lte: (j) => 0.0,
};

Imaginary.prototype.constructor = Imaginary;

module.exports = imag;
