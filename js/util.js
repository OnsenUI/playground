app.util = {};

app.util.getParam = function(param) {
  var regex = new RegExp(param + '=([\\w- ]+)');
  var query = window.location.search.replace(/\+|%20/g, ' ');
  return ((query.match(regex) || [])[1] || '');
};

app.util.arrayFrom = function(arrayLike) {
  return Array.prototype.slice.call(arrayLike);
};

app.util.resize = {
  lock: null,
  throttler: function() {
    if (!app.util.resize.lock) {
      app.util.resize.lock = setTimeout(function() {
        app.util.resize.lock = null;
        app.util.resize.handler();
       }, 50);
    }
  },
  handler: function() {
    app.editors.js.resize();
    app.editors.html.resize();
  }
};