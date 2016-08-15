window.onkeydown = function (e) {
  if (e.ctrlKey && e.keyCode == 'S'.charCodeAt(0)) {
    e.preventDefault();
    app.services.runProject();
  }
};

window.onload = function () {
  if (window.Split) {
    app.services.refreshSplit();
  }

  var placeholder = document.body.querySelector('#placeholder');
  if (placeholder) {
    placeholder.remove();
  }
};

window.onresize = function () {
  if (window.Split) {
    app.util.resize.throttler();
  }
}

window.onpopstate = function (event) {
  if (event.state) {
    app.services.updateDropdown(event.state.framework, event.state.category, event.state.module);
    app.services.loadModule(event.state.framework, event.state.category, event.state.module).then(app.services.runProject);
  } else {
    var selectedItem = document.body.querySelector('input[name="select-item"]:checked');
    if (selectedItem) {
      selectedItem.checked = false;
    }

    var external = external = app.util.getParam('external');
    if (external) {
      app.services.loadModule(external);
    } else {
      app.services.updateSelectedItem();
      app.services.showWelcomeMessage();
    }
  }
};
