var tinygradient = require('tinygradient');
var Complex = require('./complex_array');
var Profiler = require('./profiler');

var Mandle = {
  render_canvas: function(m, data) {
    if (m.is_dirty) {
      Mandle.sync_mandle_config(m);
      m.is_dirty = false;
    }

    return Profiler.task("render", function() {
      return Mandle.render(data, m.num_pixels, m.num_iter, m.ctx);
    });
  },

  get_complex_plane: function(m) {
    return Profiler.task("complex_plane", function() {
      return Mandle.complex_plane(m.num_pixels);
    });
  },

  process_subset: function(m) {
    var v = Mandle.get_generated_values(m);
    return Mandle.get_colorized_values(m, v);
  },

  get_colorized_values: function(m, v) {
    return Profiler.task("colorize", function() {
      return Mandle.colorize(v, m.num_pixels, m.num_iter, m.gradient_def, m.gradient_profile, m.gradient_counter_clockwise);
    });
  },

  //get_generated_values: function(m) {
  //  return Profiler.task("generate", function() {
  //    return Mandle.generate(m.center_x, m.center_y, m.pixel_size, m.num_pixels, m.num_iter);
  //  });
  //},

  //generate: function(center_x, center_y, pixel_spacing, num_pixels, num_iter, num_jobs, job_id) {
  //},

  get_generated_values: function(m) {
    return Profiler.task("generate", function() {
      return Mandle.generate(m.y_min, m.y_max, m.num_pixels, m.num_iter, m.edge_left, m.edge_right, m.edge_top, m.edge_bottom);
    });
  },

  generate: function(y_coord_min, y_coord_max, num_pixels, num_iter, edge_left, edge_right, edge_top, edge_bottom) {
    var num_rows = y_coord_max - y_coord_min;
    var len = num_rows * num_pixels;

    var M = new Float64Array(len);

    var dist = edge_top - edge_bottom;
    //var step = (4) / num_pixels;
    var step = (dist) / num_pixels;

    var i = 0;
    for (var y_coord = y_coord_max; y_coord > y_coord_min; y_coord -= 1) {
      var y_val = edge_top - (y_coord * step);
      for (var x_coord = 0; x_coord < num_pixels; x_coord += 1) {
        var x_val = edge_left + (x_coord * step);

        var c = [x_val, y_val];

        var num_steps = Mandle.iterate(c, num_iter);

        M[i] = num_steps;
        i++;
      }
    }

    return M;
  },

  gradient_factory: function(gradient_def, num_iter, gradient_profile, gradient_counter_clockwise) {
    var gradient = tinygradient.apply(tinygradient, gradient_def);
    return gradient[gradient_profile](num_iter + 1, !gradient_counter_clockwise);
  },

  colorize: function(M, num_pixels, num_iter, gradient_def, gradient_profile, gradient_counter_clockwise) {
    var MM = new Uint8ClampedArray(M.length * 4);
    var g = Mandle.gradient_factory(gradient_def, num_iter, gradient_profile, gradient_counter_clockwise);

    var vals = {};

    var offset = num_pixels / 2;
    var heat_value = "";
    var val, x, y;

    var strength = 1;
    var level = 50 * strength;
    var percent = (30 + level) / 100;
    var hex = (255 * percent).toFixed(0);
    var pixel_color;

    var len = MM.length;
    for (x = 0; x < len; x += 4) {
      val = M[x / 4];

      if (val <= 0) {
        MM[x]   = 0;
        MM[x+1] = 0;
        MM[x+2] = 0;
        MM[x+3] = 255;
      }
      else {
        pixel_color = g[val];

        if (pixel_color && typeof pixel_color.toHex === 'function') {
          strength = val / num_iter;
          level = 50 * strength;
          percent = (30 + level) / 100;
          hex = (255 * percent).toFixed(0);

          MM[x]   = pixel_color._r;
          MM[x+1] = pixel_color._g;
          MM[x+2] = pixel_color._b;
          MM[x+3] = 255;
        }
        else {
          MM[x]   = 255;
          MM[x+1] = 255;
          MM[x+2] = 255;
          MM[x+3] = 255;
        }
      }
    }

    return MM;
  },

  render: function(M, num_pixels, num_iter, ctx) {
    var img = new ImageData(M,num_pixels,num_pixels);
    ctx.putImageData(img, 0, 0);
    //ctx.putImageData(img, 0, 0, 0, 0, num_pixels, num_pixels);
  },

  render_mandlebrot_ascii: function(M, num_pixels) {
    result = "";

    for (var y = 0; y < num_pixels; y++) {
      result += "M: ";
      for (var x = 0; x < num_pixels; x++) {
        if (M[y*num_pixels+x] == 0.0) {
          result += " ";
        }
        else {
          result += M[y*num_pixels+x];
        }
      }
      result += '\n';
    }
    result += '\n';

    return result;
  },

  iterate: function(c, num_iter) {
    var result = [0, 0];

    var steps_out = 0;
    for (var i = 0; i < num_iter; i++) {
      result = Mandle.f_of_c(result, c);

      var is_out = (
        result[0] > 2.0 ||
        result[1] > 2.0 ||
        result[0] < -2.0 ||
        result[1] < -2.0
      );

      if (is_out) {
        steps_out = i + 1;
        break;
      }
    }

    return steps_out;
  },

  //https://randomascii.wordpress.com/2011/08/13/faster-fractals-through-algebra/
  // z.r = 0;
  // z.i = 0;
  // zrsqr = z.r * z.r;
  // zisqr = z.i * z.i;
  // while (zrsqr + zisqr < 4.0)
  // {
  //     z.i = z.r * z.i;
  //     z.i += z.i; // Multiply by two
  //     z.i += c.i;
  //     z.r = zrsqr – zisqr + c.r;
  //     zrsqr = square(z.r);
  //     zisqr = square(z.i);
  // }
  //
  //iterate: function(c, num_iter) {
  //  z_r = c[0];
  //  z_i = c[1];

  //  zrsqr = z_r * z_r;
  //  zisqr = z_i * z_i;

  //  while (zrsqr + zisqr < 2)
  //  {
  //      z_i = z_r * z_i;
  //      z_i += z_i; // Multiply by two
  //      z_i += c_i;
  //      z_r = zrsqr - zisqr + c_r;
  //      zrsqr = square(z_r);
  //      zisqr = square(z_i);
  //  }
  //},

  f_of_c: function(z, c) {
    return Complex.addComplex(Complex.mulComplex(z, z), c);
  },

  init_mandle_config: function(canvas) {
    var ctx = canvas.getContext('2d');

    var num_threads = 1;
    var num_iter = 50;
    var num_pixels = 100;

    //var gradient_def = [
    //  {color: 'blue', pos: 0},
    //  {color: 'yellow', pos: 1},
    //];

    var gradient_def = [
      '#ff0000',
      '#ff9f00',
      '#ffff00',
      '#9fff00',
      '#00ff00',
      '#00ff9f',
      '#00ffff',
      '#009fff',
      '#0000ff',
      '#9f00ff',
      '#ff00ff',
      '#ff009f',
    ];

    var gradient_profile = 'hsv';
    var gradient_counter_clockwise = false;

    var m = {
      canvas: canvas,
      ctx: ctx,
      num_iter: num_iter,
      num_threads: num_threads,
      num_pixels: num_pixels,
      gradient_def: gradient_def,
      gradient_counter_clockwise: gradient_counter_clockwise,
      gradient_profile: gradient_profile,
      zoom_level: 1,
      zoom_display: 1,
      radius: 2,
      edge_left: -2,
      edge_right: 2,
      edge_top: 2,
      edge_bottom: -2,
    };

    Mandle.sync_mandle_config(m);

    return m;
  },

  sync_mandle_config: function(m) {
    m.canvas.setAttribute('width', m.num_pixels);
    m.canvas.setAttribute('height', m.num_pixels);
  },
};

module.exports = Mandle;
