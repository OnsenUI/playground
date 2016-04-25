window.app = {};

document.addEventListener("DOMContentLoaded", function() {

  // General setup
  var module = app.util.getParam('module'),
    part = app.util.getParam('part'),
    external = app.util.getParam('external');
  if (window.Split) {
    app.setup.splitPanes();
    app.setup.modules();
    app.setup.toolbar();
  } else {
    app.setup.tabView();
  }

  //app.services.updateCategory(external ? null : module);

  // Theme setup
  if (!window.Split || window.localStorage.getItem('onsDarkSkin')) {
    document.body.classList.add('dark-skin');
  }

  // Tutorial setup
  marked.setOptions({
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: true,
    highlight: function (code, lang) {
      return lang ? hljs.highlight(lang, code).value : hljs.highlightAuto(code, ['html', 'javascript']).value;
    }
  });
  app.setup.pagesCounter();
  if ((!module || !part) && !external) {
    app.services.showWelcomeMessage();
  }

  // Editors setup
  ace.require("ace/ext/language_tools");
  app.editors = {
    html: app.setup.editor('html-input', 'html'),
    js: app.setup.editor('js-input', 'javascript')
  };
  app.editors.html.setValue(window.sessionStorage.getItem('editorHtmlContent') || '<p style="text-align: center;">Run your project!</p>', -1);
  app.editors.js.setValue(window.sessionStorage.getItem('editorJsContent') || 'console.log(\'Run your project!\')', -1);
  app.services.updateEditors();

  // Preview setup
  app.services.switchStyle(app.config.platform);
  app.config.ready
    .then(function() {
      if (external) {
        return app.services.loadModule(external);
      } else if (module && part) {
        return app.services.changeModule(module, part);
      }
      return Promise.resolve();
    })
    .then(app.services.runProject);

  document.body.querySelector('#codepen-form').onsubmit = app.services.codepenSubmit;
  document.body.querySelector('#run').onclick = app.services.runProject;
  Array.prototype.slice.call(document.body.querySelectorAll('#styling > label > span')).forEach(function(button) {
    button.onclick = function(event) {
      if (app.config.platform !== event.target.getAttribute('platform')) {
        app.services.switchStyle(event.target.getAttribute('platform'));
        app.services.runProject();
      }
    };
  });
});
