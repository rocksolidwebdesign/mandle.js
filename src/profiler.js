function report_profiling(start, end, msg) {
  var total = ((end - start) / 1000).toFixed(3);

  console.log("  END [" + total + "s] " + msg);
}

function measure_time_for_task(desc, f) {
  console.log("BEGIN [0.000s] " + desc);

  var t1 = Number(new Date());
  var result = f();
  var t2 = Number(new Date());
  report_profiling(t1, t2, desc);
  return result;
}

module.exports = {
  task: measure_time_for_task,
};
