var Ui = require('./ui');
var Mandle = require('./mandle');

disclaimer();

var canvas = document.getElementById('canvas');
var m = Mandle.init_mandle_config(canvas);

function disclaimer() {
  $("#disclaimer").dialog({
    resizable: false,
    height: "auto",
    width: 600,
    modal: true,
    buttons: {
      "I Agree": function() {
        $(this).dialog("close");
        Ui.bind_events(m);
        Ui.onRender(m);
      },
      "No Thanks": function() {
        //$(this).dialog("close");
        window.location.href = 'http://www.rocksolidwebdesign.com/';
      }
    }
  });
}
