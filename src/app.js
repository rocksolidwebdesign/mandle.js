var Profiler = require('./profiler');

var App = {
  generate_threaded: function(m) {
    var num_bins = m.num_threads || 1;

    var len = m.num_pixels;
    var bin_size = Math.ceil(len / num_bins);

    var cut_points = [];
    for (var i = 0; i < len; i += bin_size) {
      cut_points.push([i, i + bin_size]);
    }

    var t1, t2;
    return Promise.resolve()
      .then(function(data) {
        m.C = data;

        t1 = Number(new Date());
        return App.run_generate_worker(m, cut_points);
      })
      .then(function(data) {
        t2 = Number(new Date());
        var ttime = (t2 - t1);
        var ttotal = (ttime / 1000)
        console.log("ttotal generate: " + ttotal);

        return data;
      })
    ;
  },

  run_generate_worker: function(m, cut_points) {
    var num_iter = m.num_iter || 10;
    var num_pixels = m.num_pixels || 10;

    var workerTasks = cut_points.map(function(cp) {
      return new Promise(function(resolve, reject) {
        var myWorker = new Worker('worker_generate.js');

        myWorker.onmessage = resolve;

        myWorker.postMessage({
          y_min: cp[0],
          y_max: cp[1],
          num_iter: num_iter,
          num_pixels: num_pixels,
          gradient_def: m.gradient_def,
          gradient_profile: m.gradient_profile,
          gradient_counter_clockwise: m.gradient_counter_clockwise,
          edge_left: m.edge_left,
          edge_right: m.edge_right,
          edge_top: m.edge_top,
          edge_bottom: m.edge_bottom,
        });
      });
    });

    var resultPromise = Promise.all(workerTasks).then(function(messages) {
      var length = num_pixels * num_pixels * 4;
      var imageData = new Uint8ClampedArray(length);

      var i = 0;
      messages.reverse().forEach(function(e, section) {
        var arr = new Uint8ClampedArray(e.data);
        var n = arr.length;

        for (var j = 0; j < n; j++) {
          imageData[i++] = arr[j];
        }
      });

      imageData.length

      return imageData;
    });

    return resultPromise;
  },
};

module.exports = App;
