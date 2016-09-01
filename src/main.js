var Ui = require('./ui');
var Mandle = require('./mandle');

disclaimer();

var canvas = document.getElementById('canvas');
var m = Mandle.init_mandle_config(canvas);

function disclaimer() {
  var $d = $('#disclaimer');

  $d.on('hidden.bs.modal', function (e) {
  });

  $('.js-disclaimer-ok').on('click', function(e) {
    Ui.bind_events(m);
    Ui.onRender(m);

    $d.modal('hide');
  });

  $('.js-disclaimer-cancel').on('click', function(e) {
    window.location.href = 'http://www.rocksolidwebdesign.com/';
  });

  $d.modal();
}
