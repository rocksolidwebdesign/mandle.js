var Throbber = require('./spinner');
var App = require('./app');
var Mandle = require('./mandle');

function onRender(m) {
  if (m.is_rendering) {
    return false;
  }

  var throbEl = document.getElementById('render_spinner');
  var throb = new Throbber(throbEl);
  throb.show();

  m.is_rendering = true;
  App.generate_threaded(m).then(function(data) {
    Mandle.render_canvas(m, data);
    m.is_rendering = false;
    throb.hide();
  });
}

function onChangeProfile(m, e) {
  var val = $(e.currentTarget).val();

  m.gradient_profile = val;

  m.is_dirty = true;
}

function onChangeClockwise(m, e) {
  var val = $(e.currentTarget).val();

  if (val === 'counter_clockwise') {
    m.gradient_counter_clockwise = true;
  }
  else {
    m.gradient_counter_clockwise = false;
  }

  m.is_dirty = true;
}

function onChangePixels(m, e) {
  var val = $(e.currentTarget).val();

  if (val.match(/^[0-9]+$/) && !isNaN(val)) {
    m.num_pixels = Number(val);

    m.is_dirty = true;
  }
}

function onChangeMove(m, e) {
  if (m.is_rendering) {
    return false;
  }

  var direction = $(e.currentTarget).data('move');

  var dist = (m.edge_top - m.edge_bottom) * 0.1;
  if (direction === 'n') {
    m.edge_top -= dist;
    m.edge_bottom -= dist;
  }
  else if (direction === 's') {
    m.edge_top += dist;
    m.edge_bottom += dist;
  }
  else if (direction === 'e') {
    m.edge_left += dist;
    m.edge_right += dist;
  }
  else if (direction === 'w') {
    m.edge_left -= dist;
    m.edge_right -= dist;
  }

  onRender(m);
}

function onChangeZoom(m, e) {
  var direction = $(e.currentTarget).data('zoom');

  if (m.is_rendering) {
    return false;
  }

  var zoomDist = 0.1;
  var dist = (m.edge_top - m.edge_bottom) * zoomDist;

  if (direction === 'in') {
    if (m.zoom_display + zoomDist > 15.05) {
      return;
    }

    m.zoom_level -= zoomDist;
    m.zoom_display += zoomDist;

    m.edge_top -= dist;
    m.edge_bottom += dist;
    m.edge_left += dist;
    m.edge_right -= dist;
  }
  else if (direction === 'out') {
    if (m.zoom_display - zoomDist < 0.5) {
      return;
    }

    m.zoom_level += zoomDist;
    m.zoom_display -= zoomDist;

    m.edge_top += dist;
    m.edge_bottom -= dist;
    m.edge_left -= dist;
    m.edge_right += dist;
  }

  var zoomPercent = (m.zoom_display * 100);
  var displayLevel = zoomPercent.toFixed(0) + '%';

  $('.js-zoom-display').val(displayLevel);

  onRender(m);
}

function onChangeIterations(m, e) {
  var val = $(e.currentTarget).val();

  var saneVal = val.replace(/[^0-9]/, '').slice(0,3);

  if (!isNaN(saneVal)) {
    var realVal = Number(saneVal);
    if (realVal < 10) {
      realVal = 10;
    }

    m.num_iter = realVal;
  }
  else {
    m.num_iter = 50;
  }

  $('.js-input-iterations').val(m.num_iter);

  m.is_dirty = true;
}

function onChangeNumThreads(m, e) {
  var val = $(e.currentTarget).val();

  if (val.match(/^[0-9]+$/) && !isNaN(val)) {
    m.num_threads = Number(val);
    m.is_dirty = true;
  }
}

function bind_events(m) {
  $('form').on('submit', function(e) {
    console.log("abort");
    e.preventDefault();
    return false;
  });

  $('.js-render-btn').on('click', function(e) {
    e.preventDefault();

    onRender(m);

    return false;
  });

  $('.js-input-pixels').on('change', function(e) {
    e.preventDefault();

    onChangePixels(m, e);

    return false;
  });

  $('.js-input-iterations').on('change', function(e) {
    e.preventDefault();

    onChangeIterations(m, e);

    return false;
  });

  $('.js-input-num-threads').on('change', function(e) {
    e.preventDefault();

    onChangeNumThreads(m, e);

    return false;
  });

  $('.js-input-move').on('click', function(e) {
    e.preventDefault();

    onChangeMove(m, e);

    return false;
  });

  $('.js-input-zoom').on('click', function(e) {
    e.preventDefault();

    onChangeZoom(m, e);

    return false;
  });

  $('.js-input-clockwise').on('change', function(e) {
    e.preventDefault();

    onChangeClockwise(m, e);

    return false;
  });
}

module.exports = {
  bind_events: bind_events,
  onRender: onRender,
};
