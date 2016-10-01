window.app = {};

document.addEventListener("DOMContentLoaded", function () {
  app.config.welcomeMessage = document.querySelector('#tutorial-content').innerHTML;

  // General setup
  var framework = app.util.getParam('framework'),
    category = app.util.getParam('category'),
    module = app.util.getParam('module'),
    external = app.util.getParam('external');
  if (window.Split) {
    app.setup.splitPanes();
    app.setup.modules();
    app.setup.toolbar();
    if (framework && category && module) {
      app.services.updateDropdown(framework, category, module);
    }
  } else {
    app.setup.tabView();
  }

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

  // Editors setup
  ace.require("ace/ext/language_tools");
  app.editors = {
    html: app.setup.editor('html-input', 'html'),
    js: app.setup.editor('js-input', 'javascript')
  };
  app.setup.pagesCounter();
  if ((!framework || !category || !module) && !external) {
    app.services.showWelcomeMessage();
  }

  // Preview setup
  app.services.switchStyle(app.config.platform);
  if (external) {
    app.services.loadModule(external).then(app.services.runProject);
  } else if (framework && category && module) {
    app.services.changeModule(framework, category, module).then(app.services.runProject);
  } else {
    app.services.runProject();
  }

  document.querySelector('#run').onclick = app.services.runProject;
  Array.prototype.slice.call(document.querySelectorAll('#styling > label > span')).forEach(function (button) {
    button.onclick = function (event) {
      if (app.config.platform !== event.target.getAttribute('platform')) {
        app.services.switchStyle(event.target.getAttribute('platform'));
        app.services.runProject();
      }
    };
  });
});
