window.app = {};

document.addEventListener("DOMContentLoaded", function() {

  // General setup
  if (window.Split) {
    app.setup.splitPanes();
    app.setup.modules();
    app.setup.toolbar();
  } else {
    app.setup.tabView();
  }

  // Theme setup
  if (!window.Split || window.localStorage.getItem('onsDarkSkin')) {
    document.body.classList.add('dark-skin');
  }

  // Editors setup
  ace.require("ace/ext/language_tools");
  app.editors = {
    html: app.setup.editor('html-input', 'html'),
    js: app.setup.editor('js-input', 'javascript')
  };
  app.editors.html.setValue(window.sessionStorage.getItem('editorHtmlContent') || '<p style="text-align: center;">Run your project!</p>', -1);
  app.editors.js.setValue(window.sessionStorage.getItem('editorJsContent') || 'console.log(\'Run your project!\')', -1);
  app.services.updateEditorTitle();

  // Preview setup
  app.services.switchStyle();
  var module = app.util.getParam('module'), part = app.util.getParam('part');
  app.config.ready
    .then(function() {
      return (module && part) ? app.services.changeModule(module, part) : Promise.resolve();
    })
    .then(app.services.runProject);

  document.body.querySelector('#codepen-form').onsubmit = app.services.codepenSubmit;
  document.body.querySelector('#run').onclick = app.services.runProject;
  document.body.querySelector('#styling button').onclick = function() {
    app.services.switchStyle();
    app.services.runProject();
  };

  // Tutorial setup
  app.setup.pagesCounter();
  if (!module || !part) {
    app.services.showWelcomeMessage();
  }

});
