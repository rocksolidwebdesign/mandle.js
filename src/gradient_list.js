var tinygradient = require('tinygradient');

// 100-0-0
// 100-50-0
// 100-100-0
// 50-100-0
//
// 0-100-0
// 0-100-50
// 0-100-100
// 0-50-100
//
// 0-0-100
// 50-0-100
// 100-0-100
// 100-0-50

function GradientList() {
  this.gradients = [
    {
      id: 1,
      name: "Blue Yellow",
      gradient: tinygradient('blue', 'yellow'),
    },
    {
      id: 2,
      name: "Pink on Blue",
      gradient: tinygradient(
        'blue', 'red', 'green', 'purple', 'orange', 'green', 'purple', 'yellow',
        'blue', 'red', 'green', 'purple', 'orange', 'green', 'purple', 'yellow',
        'blue', 'red', 'green', 'purple', 'orange', 'green', 'purple', 'yellow',
        'blue', 'red', 'green', 'purple', 'orange', 'green', 'purple', 'yellow',
        'blue', 'red', 'green', 'purple', 'orange', 'green', 'purple', 'yellow'
      ),
    },
    {
      id: 3,
      name: "Random Rainbow",
      gradient: tinygradient(
          {color: 'blue', pos: 0},
          {color: 'red', pos: 0.025},
          {color: 'orange', pos: 0.3},
          {color: 'green', pos: 0.5},
          {color: 'yellow', pos: 1}
          ),
    },
  ];
}

GradientList.prototype = {
  search: function(name) {
    var p = new RegExp(".*" + name + ".*", 'i');
    return this.gradients.filter(function(x) {
      return x.name.match(p);
    });
  },

  find: function(name) {
    return this.gradients.find(function(x) {
      return x.name === name;
    });
  },

  get: function(id) {
    return this.gradients.find(function(x) {
      return String(x.id) === String(id);
    });
  },
};

GradientList.prototype.constructor = GradientList;

module.exports = GradientList;
