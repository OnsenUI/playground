app.services = {};

app.services.generateTemplate = {};

app.services.generateTemplate.output = function() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>OnsenUI Tutorial</title>

      <script src="${app.config.lib.js.onsenui}"></script>
      {{framework}}

      <script>
        ons.platform.select('${app.config.platform}');
      </script>

      <link rel="stylesheet" href="${app.config.lib.css.onsenui}">
      <link rel="stylesheet" href="${app.config.lib.css.onsenuiCssComponents}">

      <script>
        {{javascript}}
      </script>

    </head>

    <body>
      {{html}}
    </body>
    </html>
  `;
};

app.services.generateTemplate.react = function() {
  return `
      <script src="${app.config.lib.js.react}"></script>
      <script src="${app.config.lib.js.reactDom}"></script>
      <script src="${app.config.lib.js.reactDomServer}"></script>
      <script src="${app.config.lib.js.reactOnsenui}"></script>`;
};

app.services.showWelcomeMessage = function() {
  var message = `
## Welcome

This is the Onsen UI Interactive Tutorial. Select a module and blah blah...

  * In the preview section you can switch between iOS and Android view for Automatic Styling.

  * If you want to save any of these examples you export the code to Codepen.

  * Press 'ctrl + s' to quickly refresh the preview.


This is the Onsen UI Interactive Tutorial. Select a module and blah blah...

![onsen](assets/icons/onsenui.svg)

` ;

  document.body.querySelector('#tutorial-content').innerHTML = marked(message);
};


app.services.runProject = function() {
  window.sessionStorage.setItem('editorHtmlContent', app.editors.html.getValue());
  window.sessionStorage.setItem('editorJsContent', app.editors.js.getValue());
  window.sessionStorage.setItem('jsTranspiler', app.config.transpiler);
  document.querySelector('#output iframe').srcdoc = app.services.generateTemplate.output()
    .replace('{{framework}}', app.services.loadFrameworkLib())
    .replace('{{html}}', app.editors.html.getValue())
    .replace('{{javascript}}', app.services.transpile(app.editors.js.getValue()));
};

app.services.codepenSubmit = function() {
  document.body.querySelector('#codepen-data').value = JSON.stringify({
    title: 'Onsen UI',
    description: 'Onsen UI Tutorial Export',
    html:  app.editors.html.getValue(),
    js: app.editors.js.getValue(),
    editors: '101',
    js_external: app.config.lib.js.onsenui + app.services.externalLibraries(),
    css_external: app.config.lib.css.onsenui + ';' + app.config.lib.css.onsenuiCssComponents,
    js_pre_processor: app.config.transpiler
  });
};

app.services.switchStyle = function() {
  var buttonIcon = document.querySelector('#styling-icon'),
    buttonLabel = document.querySelector('#styling-label');

  buttonIcon.classList.remove('icon-' + app.config.platform);
  app.config.platform = buttonLabel.innerHTML = app.config.platform ==='ios' ? 'android' : 'ios';
  buttonIcon.classList.add('icon-' + app.config.platform);
};

app.services.toggleTheme = function() {
  document.body.classList.toggle('dark-skin');
  window.localStorage[window.localStorage.getItem('onsDarkSkin') ? 'removeItem' : 'setItem']('onsDarkSkin', 'true');
  Object.keys(app.editors).forEach(function(editor) {
    app.editors[editor].setTheme('ace/theme/' + (document.body.classList.contains('dark-skin') ? 'monokai' : 'chrome'));
  });
};

app.services.changeModule = function(module, part) {
  if (!part) {
    part = app.selectList.options[app.selectList.selectedIndex].label;
    module = app.selectList.options[app.selectList.selectedIndex].parentElement.label;
    window.history.pushState({
      module: module,
      part: part
    }, '', '?module=' + module.replace(/\s/g, '%20') + '&part=' + part.replace(/\s/g, '%20'));
  } else if (window.Split) {
    var group = app.selectList.querySelector('optgroup[label="' + module + '"]');
    app.util.arrayFrom(group.children).forEach(function(option) {
      if (option.value === part) {
        option.selected = true;
      }
    });
  }

  return new Promise(function(resolve) {
    var request = new XMLHttpRequest();
    request.onload = function() {

      var format = app.util.format,
        extract = app.util.extract;

      var html = format(extract(this.responseText, /<body>([\s\S]*)<\/body>/));
      var docs = extract(this.responseText, /<\/html>\s*<!--.*\n([\s\S]*)-->/).trim();
      var script = extract(this.responseText, /<head>[\s\S]*(<script[\s\S]*<\/script>)[\s\S]*<\/head>/);
      var code = format(extract(script, /<script.*>([\s\S]*)<\/script>/));

      app.editors.html.setValue(html, -1);
      app.editors.js.setValue(code, -1);

      var rawTranspiler = (format(extract(script, /^<script\s*type="text\/([\w-]+)"\s*>/)) || 'javascript').toLowerCase();

      switch (rawTranspiler) {
        case 'jsx':
        case 'babel':
        case 'react':
          app.config.transpiler = 'babel';
          break;
        default:
          app.config.transpiler = 'none';
      }

      app.services.updateTitles(module);

      app.tutorial = {
        pageIndex: 0,
        pages: docs.split(/\n(?=[ \t]*#{2}(?!#))/).map(function(e) {
          return marked(e);
        })
      };

      if (app.selectList && app.selectList.selectedIndex !== 0 && app.selectList.selectedIndex < app.selectList.length - 1) {
        var nextTutorialTitle = app.selectList.querySelectorAll('option')[app.selectList.selectedIndex + 1].label;
        app.tutorial.pages[app.tutorial.pages.length - 1] += '<button class="next-tutorial" onclick="app.services.nextTutorial()">Next: ' + nextTutorialTitle + '</button>';
      }

      document.getElementById('pages-current').innerHTML = app.tutorial.pageIndex + 1;
      document.getElementById('pages-total').innerHTML = app.tutorial.pages.length;
      document.getElementById('tutorial-content').innerHTML = app.tutorial.pages[0];

      resolve();
    };

    request.open('get', `./tutorial/${module.replace(/\s/g, '_')}/${part.replace(/\s/g, '_')}.html`);
    request.send();
  });
};

app.services.transpile = function(code) {
  if (app.config.transpiler === 'none') {
    return code;
  }

  return Babel.transform(code, { presets: ['react'] }).code;
};

app.services.updateTitles = function(module) {
  var editorTitle = window.Split ? document.querySelector('#rightBottomPane .editor-title') : document.querySelector('label[for="tab-2"]');
  switch (app.config.transpiler) {
    case 'babel':
      editorTitle.innerHTML = 'JSX';
      break;
    default:
      editorTitle.innerHTML = 'JS';
  }

  if (window.Split) {
    document.querySelector('#module-title-text').innerHTML = (module || 'Welcome!');
  }
}

app.services.loadFrameworkLib = function() {
  if (app.config.transpiler === 'none') {
    return '';
  }

  return app.services.generateTemplate.react();

};

app.services.externalLibraries = function() {
  if (app.config.transpiler === 'none') {
    return '';
  }

  return `;${app.config.lib.js.react};${app.config.lib.js.reactDom};${app.config.lib.js.reactDomServer};${app.config.lib.js.reactOnsenui}`;
};

app.services.nextTutorial = function() {
  if (app.selectList.selectedIndex < app.selectList.length - 1) {
    app.selectList.selectedIndex += 1;
    app.services.changeModule().then(app.services.runProject);
  }
};
