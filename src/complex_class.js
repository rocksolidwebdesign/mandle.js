function Complex(arg) {
}

Complex.prototype = {
  add_r: (r) => 0.0,
  add_i: (j) => 0.0,
  add_c: (z) => 0.0,
  sub_r: (r) => 0.0,
  sub_i: (j) => 0.0,
  sub_c: (z) => 0.0,
  mul_r: (r) => 0.0,
  mul_i: (j) => 0.0,
  mul_c: (z) => 0.0,
  div_r: (r) => 0.0,
  div_i: (j) => 0.0,
  div_c: (z) => 0.0,

  eq: (j) => 0.0,
  neq: (j) => 0.0,
};

Complex.prototype.constructor = Complex;

module.exports = complex;
