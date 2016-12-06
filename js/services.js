/* global app */
app.services = {};

app.services.generateTemplateOutput = function () {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>OnsenUI Tutorial</title>

      <script>
        window._onsNightlyBuild = ${app.config.nightly};
        window._onsAngular2LibVersion = '${app.config.versions['angular2-onsenui'] || ''}';
      </script>
      ${app.services.getTranspilerLib()}
      ${app.services.getJSLibs()}
      <script>
        ons.platform.select('${app.config.platform}');
      </script>
      <script type="text/${app.config.codeType}">
        ${app.editors.js.getValue()}
      </script>

      ${app.services.getCSSLibs()}
      <link href='https://fonts.googleapis.com/css?family=Roboto:400,300italic,300,500,400italic,500italic,700,700italic' rel='stylesheet' type='text/css'>
    </head>

    <body>
      ${app.editors.html.getValue()}
    </body>
    </html>
  `;
};

app.services.getJSLibs = function () {
  var libs = app.services.getRequiredLibs();
  var result = '';

  libs.forEach(function (lib) {
    result += `\n  <script src="${lib}"></script>`
  });

  return result;
}

app.services.getCSSLibs = function () {
  var css = app.config.lib().css;
  return `
  <link rel="stylesheet" href="${css.onsenui}">
  <link rel="stylesheet" href="${css.onsenuiCssComponents}">`;
};

app.services.showWelcomeMessage = function () {
  document.getElementById('pages-current').innerHTML = 1;
  document.getElementById('pages-total').innerHTML = 1;
  document.getElementById('tutorial-content').innerHTML = app.config.welcomeMessage;
  app.tutorial = {
    pageIndex: 0,
    pages: 1
  };

  var html = window.sessionStorage.getItem('editorHtmlContent') || '<p style="text-align: center;">Run your project!</p>';
  var code = window.sessionStorage.getItem('editorJsContent') || 'console.log(\'Run your project!\');';
  app.services.updateEditors(html, code);
};


app.services.runProject = function () {
  window.sessionStorage.setItem('editorHtmlContent', app.editors.html.getValue());
  window.sessionStorage.setItem('editorJsContent', app.editors.js.getValue());

  window.srcDoc.set(document.querySelector('#output iframe'), app.services.generateTemplateOutput());
};

app.services.codepenSubmit = function () {
  var css = app.config.lib().css;

  var options = {
    title: 'Onsen UI',
    description: 'Onsen UI Tutorial Export',
    html: app.editors.html.getValue(),
    js: app.editors.js.getValue(),
    editors: '101',
    js_external: app.services.getRequiredLibs().join(';'),
    css_external: css.onsenui + ';' + css.onsenuiCssComponents,
    js_pre_processor: app.config.codeType
  };

  // Fix TypeScript in Codepen
  if (app.config.codeType === 'typescript') {
    options.html = `${options.html}

<script type="text/typescript">
${options.js}
</script>
`;
    options.js = '';
    options.js_external += ';https://unpkg.com/typescript@1.8.10';
    options.editors = '100';
  }

  document.querySelector('#codepen-data').value = JSON.stringify(options);
};

app.services.switchStyle = function (platform) {
  app.config.platform = platform;
};

app.services.toggleTheme = function () {
  document.body.classList.toggle('dark-skin');
  window.localStorage[window.localStorage.getItem('onsDarkSkin') ? 'removeItem' : 'setItem']('onsDarkSkin', 'true');
  Object.keys(app.editors).forEach(function (editor) {
    app.editors[editor].setTheme('ace/theme/' + ((document.body.classList.contains('dark-skin')) ? 'monokai' : 'chrome'));
  });
};

app.services.changeModule = function (framework, category, module) {
  window.history.pushState({
    framework: framework,
    category: category,
    module: module
  }, '', '?framework=' + framework + '&category=' + category.replace(/\s/g, '%20') + '&module=' + module.replace(/\s/g, '%20'));

  return app.services.loadModule(framework, category, module);
};

app.services.loadModule = function (framework, category, module) {
  return app.util.request(module ? `./tutorial/${framework}/${category.replace(/\s/g, '_')}/${module.replace(/\s/g, '_')}.html` : framework)
    .then(function (responseText) {
      var format = app.util.format,
        extract = app.util.extract;

      var html = format(extract(responseText, /<body>([\s\S]*)<\/body>/));
      var docs = extract(responseText, /<\/html>\s*<!--.*\n([\s\S]*)-->/).trim();
      var script = extract(responseText, /<head>[\s\S]*(<script[\s\S]*<\/script>)[\s\S]*<\/head>/);
      var code = format(extract(script, /<script.*>([\s\S]*)<\/script>/));

      app.config.codeType = (format(extract(script, /^<script\s*type="text\/([\w-]+)"\s*>/)) || 'javascript').toLowerCase();
      app.config.framework = app.util.getParam('framework');

      app.services.updateEditors(html, code);

      app.tutorial = {
        pageIndex: 0,
        pages: docs.split(/\n(?=[ \t]*#{2}(?!#))/).map(function (e) {
          return marked(e);
        })
      };

      document.querySelector('#pages-current').innerHTML = app.tutorial.pageIndex + 1;
      document.querySelector('#pages-total').innerHTML = app.tutorial.pages.length;
      app.services.updateTutorialPage();

      if (window.Split && app.config.autoHideHTMLPane !== false) {
        if (['react', 'angular2'].indexOf(app.config.framework) !== -1) {
          app.services.resizeHTMLPane(0);
        } else if (app.config.initRightPanePos) {
          app.services.resizeHTMLPane(app.config.initRightPanePos);
        }
      }
    },
    console.error.bind(console)
  );
};

app.services.updateDropdown = function (framework, category, module) {
  app.services.updateSelectedItem(framework, module);
  category = app.util.parseId(category);
  module = app.util.parseId(module);
  document.querySelector('#r-' + framework).checked = true;
  document.querySelector('#c-' + framework + '-' + category).checked = true;
  document.querySelector('#r-' + framework + '-' + category + '-' + module).checked = true;
};

app.services.updateSelectedItem = function (framework, module) {
  if (window.Split) {
    var description = module ? document.querySelector('label[module="' + module + '"]').getAttribute('desc') : 'Select Tutorial';
    document.querySelector('#modules .select-item').innerHTML = description;
    var thumbnail = document.querySelector('#modules .select-thumbnail');
    thumbnail.setAttribute('class', 'select-thumbnail ' + (framework ? (framework + '-thumbnail') : ''));
  }
};

app.services.updateEditors = function (html, js) {
  app.editors.html.session.setValue(html, -1);
  app.editors.js.session.setValue(js, -1);

  var editorTitle = window.Split ? document.querySelector('#rightBottomPane .editor-title') : document.querySelector('label[for="tab-2"]');
  switch (app.config.codeType) {
    case 'babel':
      editorTitle.innerHTML = 'JSX';
      app.editors.js.session.setMode('ace/mode/jsx');
      break;
    case 'typescript':
      editorTitle.innerHTML = 'TS';
      app.editors.js.session.setMode('ace/mode/typescript');
      break;
    default:
      editorTitle.innerHTML = 'JS';
      app.editors.js.session.setMode('ace/mode/javascript');
  }
};

app.services.getRequiredLibs = function () {
  var libs = app.config.lib()
  var requiredLibs = {
    'onsenui': {
      'onsen/js': [libs.js.onsenui],
      'onsen/css': [libs.css.onsenui, libs.css.onsenuiCssComponents]
    }
  };

  switch (app.config.framework) {
    case 'react':
      requiredLibs.react = {
        'react': [libs.js.react, libs.js.reactDom],
        'react-onsenui': [libs.js.reactOnsenui]
      }
      break;
    case 'angular1':
      requiredLibs.angular1 = {
        'angular1': [libs.js.angular1],
        'onsen/js': [libs.js.angularOnsenui]
      }
      break;
    case 'angular2':
      requiredLibs.angular2 = {
        'systemjs': [libs.js.systemjs, '/js/onsenui.system.js'],
        'corejs': [libs.js.corejs],
        'zone': [libs.js.zone]
      }
      break;
  }

  return app.util.flattenJSLibs(requiredLibs);
};

app.services.getTranspilerLib = function () {
  switch (app.config.codeType) {
    case 'babel':
      return `<script src="https://unpkg.com/babel-core@5.8.38/browser.min.js"></script>`;
    case 'typescript':
      return `<script src="lib/typescript/typescript-1.8.10.min.js"></script>`;
    default:
      return '';
  }
};

app.services.updateTutorialPage = function () {
  var tutorialContent = document.querySelector('#tutorial-content');
  tutorialContent.innerHTML = app.tutorial.pages[app.tutorial.pageIndex];
  tutorialContent.scrollTop = 0;
};

app.services.refreshSplit = function (selector, position) {
  var gutter = document.querySelector('#rightPane').previousElementSibling;
  app.util.simulatePanelDrag(gutter, 'x', gutter.getBoundingClientRect().right);
};

app.services.resizeHTMLPane = function(newPosition) {
  var gutter = document.querySelector('#rightPane .gutter-vertical');
  app.config.initRightPanePos = app.config.initRightPanePos || gutter.getBoundingClientRect().top;
  app.util.simulatePanelDrag(gutter, 'y', newPosition);
};

app.services.modifySource = function () {
  var state = window.history.state;
  if (state) {
    window.open(`https://github.com/OnsenUI/tutorial/edit/master/tutorial/${state.framework}/${state.category.replace(/\s/g, '_')}/${state.module.replace(/\s/g, '_')}.html`, '_blank');
  }
};
