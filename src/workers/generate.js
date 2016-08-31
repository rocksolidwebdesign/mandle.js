var Mandle = require('../mandle');

onmessage = function(e) {
  var m = e.data;
  var workerResult = Mandle.process_subset(m);

  postMessage(workerResult.buffer, [workerResult.buffer]);
};
