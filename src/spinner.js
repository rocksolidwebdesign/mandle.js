var default_spinner_opts = {
    lines: 13 // The number of lines to draw
      , length: 5 // The length of each line
      , width: 2 // The line thickness
      , radius: 5 // The radius of the inner circle
      , scale: 1 // Scales overall size of the spinner
      , corners: 1 // Corner roundness (0..1)
      , color: '#777777' // #rgb or #rrggbb or array of colors
      , opacity: 0.25 // Opacity of the lines
      , rotate: 0 // The rotation offset
      , direction: 1 // 1: clockwise, -1: counterclockwise
      , speed: 1 // Rounds per second
      , trail: 60 // Afterglow percentage
      , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
      , zIndex: 3e9 // The z-index (defaults to 2000000000)
      , className: 'spinner' // The CSS class to assign to the spinner
      , top: '50%' // Top position relative to parent
      , left: '50%' // Left position relative to parent
      , shadow: false // Whether to render a shadow
      , hwaccel: false // Whether to use hardware acceleration
      , position: 'relative' // Element positioning
};

function S(el, opts) {
  this.el = el || document.getElementById('spinner');
  this.opts = opts || default_spinner_opts;
  this.spinner = new Spinner(this.opts);
}

S.prototype = {
  hide: function() {
    this.spinner.stop();
    //$(el).addClass('hide');
  },

  show: function() {
    this.spinner.spin();
    this.el.appendChild(this.spinner.el);
    //$(el).removeClass('hide');
  }
}

module.exports = S;
