/* global app, marked, platform */
app.services = {};

app.services.generateTemplateOutput = function () {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>OnsenUI Tutorial</title>

      ${app.config.framework === 'angular2' ? app.services.generateAngular2Globals() : ''}

      <!-- Required libs -->
      ${app.services.getTranspilerLib()}
      ${app.services.getJSLibs()}

      <!-- Autostyling -->
      <script>
        ons.platform.select('${app.config.platform}');
      </script>

      <!-- App -->
      <script type="text/${app.config.codeType}">
        ${app.config.framework === 'vue' ? 'ons.ready(function() {' : ''}
          ${app.editors.js.getValue()}
        ${app.config.framework === 'vue' ? '});' : ''}
      </script>

      <!-- Stylesheet -->
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
  var libs = app.util.flattenJSLibs(app.services.getRequiredLibs());
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
  var libs = app.services.getRequiredLibs(true);
  var cssLibs = libs.onsenui['onsen/css'];
  var jsLibs = app.util.flattenJSLibs(libs);

  var options = {
    title: 'Onsen UI',
    description: 'Onsen UI Tutorial Export',
    html: app.editors.html.getValue(),
    js: app.editors.js.getValue(),
    editors: '101',
    js_external: jsLibs.join(';'),
    css_external: cssLibs.join(';'),
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
      app.config.framework = framework;

      app.services.updateEditors(html, code);

      app.tutorial = {
        pageIndex: 0,
        pages: app.services.generateTutorialPages(docs)
      };

      app.services.updateTutorialPage();
      app.services.collapseEditors(html, code);
    },
    console.error.bind(console)
  );
};

app.services.generateTutorialPages = function(markdown) {
  return markdown.split(/\n(?=[ \t]*#{2}(?!#))/).map(function (e) {
    return marked(e) + '<br><br>';
  });
};

app.services.collapseEditors = function (html, code) {
  if (window.Split && app.config.autoHideHTMLPane !== false) {
    if (html.split(/\n/).length <= 1) {
      app.splits.editors.collapse(0);
    } else if (code.split(/\n/).length <= 4) {
      app.splits.editors.collapse(1);
    } else {
      app.splits.editors.setSizes([50, 50]);
    }

    app.util.resize.editorResize();
  }
};

app.services.loadIssue = function(issue) {
  var matchRegExp = function(keyword, text, template) {
    var regexp = new RegExp(template.replace('placeholder', keyword), 'im');
    return (text.match(regexp) || []).slice(1, 3);
  };

  app.util.request('https://api.github.com/repos/OnsenUI/OnsenUI/issues/' + issue).then(function(responseText) {
    var content = JSON.parse(responseText).body;
    var regexSection = '\\[placeholder]\\s+([a-zA-Z0-9\\-]+)\\s+(.+)\\s+';
    var regexCode = '__placeholder__\\s+```[a-zA-z]*\\s+((.|\\s)*?)```';

    // Get core version
    var m = matchRegExp('Core', content, regexSection);
    app.config.versions.onsenui = m[1];

    // Get framework version
    m = matchRegExp('Framework', content, regexSection);
    if (m && m.length === 2) {
      app.config.versions[m[0]] = m[1];
    }

    // Get bindings name + version and framework name
    m = matchRegExp('Framework binding', content, regexSection);
    if (m && m.length === 2) {
      app.config.versions[m[0]] = m[1];
      var currentFramework = m[0].split('-')[0].toLowerCase();
      if (app.config.extLibs.indexOf(currentFramework) >= 0) {
        app.config.framework = currentFramework;
      }
    }

    // Fallback to vanilla
    if (!app.config.framework || app.config.framework === 'none') {
      app.config.framework = 'vanilla';
    }

    // Get code
    var html = matchRegExp('HTML', content, regexCode);
    var js = matchRegExp('JS', content, regexCode);
    if (html && html.length >= 1 && js && js.length >= 1) {
      app.services.updateEditors(html[0], js[0]);
    }

    // Get info
    var info = content.match(/(__Environment__\s+(.|\s)*?)\[__Demo link__]/im);
    if (info && info.length >= 1) {

      app.tutorial = {
        pageIndex: 0,
        pages: app.services.generateTutorialPages(info[1].replace(/__([a-zA-z -]+)__/gm, function(title) {
          return '## ' + title;
        }))
      };
      app.services.updateTutorialPage();
    }

    app.splits.docsDemo.collapse(0);
    app.services.collapseEditors(html[0], js[0]);
    app.services.updateSelectedItem(app.config.framework, false, 'Issue ' + issue);
    app.services.runProject();
  });
};

app.services.updateDropdown = function (framework, category, module) {
  app.services.updateSelectedItem(framework, module);
  category = app.util.parseId(category);
  module = app.util.parseId(module);
  document.querySelector('#r-' + framework).checked = true;
  document.querySelector('#c-' + framework + '-' + category).checked = true;
  document.querySelector('#r-' + framework + '-' + category + '-' + module).checked = true;
};

app.services.updateSelectedItem = function (framework, module, forceTitle) {
  var description = module ? document.querySelector('label[module="' + module + '"]').getAttribute('desc') : (forceTitle || 'Select Template');
  document.querySelector('#modules .select-item').innerHTML = description;
  var thumbnail = document.querySelector('#modules .select-thumbnail');
  thumbnail.setAttribute('class', 'select-thumbnail ' + (framework ? (framework + '-thumbnail') : ''));
};

app.services.updateEditors = function (html, js) {
  app.editors.html.session.setValue(html, -1);
  app.editors.js.session.setValue(js, -1);

  var editorTitle = window.Split ? document.querySelector('#rightBottomPane .editor-title') : document.querySelector('label[for="tab-2"]');
  switch (app.config.codeType) {
    case 'babel':
      if (app.config.framework === 'react') {
        editorTitle.innerHTML = 'JSX';
        app.editors.js.session.setMode('ace/mode/jsx');
      } else {
        editorTitle.innerHTML = 'JS';
        app.editors.js.session.setMode('ace/mode/javascript');
      }
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

app.services.getRequiredLibs = function (forceRemote) {
  var libs = app.config.lib(forceRemote)

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
    case 'vue':
      requiredLibs.vue = {
        'vue': [libs.js.vue],
        'vue-onsenui': [libs.js.vueOnsenui]
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
      'systemjs': [libs.js.systemjs, (app.config.local ? '.' : 'https://tutorial.onsen.io') + '/js/onsenui.system.js'],
        'corejs': [libs.js.corejs],
        'zone': [libs.js.zone]
      }
      break;
  }

  return requiredLibs;
};

app.services.getTranspilerLib = function () {
  return `<script src="${app.config.transpilerLib[app.config.codeType] || ''}"></script>`;
};

app.services.updateTutorialPage = function (content) {
  document.querySelector('#pages-current').innerHTML = app.tutorial.pageIndex + 1;
  document.querySelector('#pages-total').innerHTML = app.tutorial.pages.length;

  var contentElement = document.querySelector('#tutorial-content');
  contentElement.innerHTML = content ? marked(content) : app.tutorial.pages[app.tutorial.pageIndex];
  contentElement.scrollTop = 0;
};

app.services.modifySource = function () {
  var state = window.history.state;
  if (state) {
    window.open(`https://github.com/OnsenUI/tutorial/edit/master/tutorial/${state.framework}/${state.category.replace(/\s/g, '_')}/${state.module.replace(/\s/g, '_')}.html`, '_blank');
  }
};

app.services.reportIssue = function () {
  var state = window.history.state;
  if (state) {
    var libs = ['onsenui'];
    if (app.config.framework !== 'vanilla') {
      libs.push(app.config.framework + '-onsenui');
    }

    var promises = [];

    libs.forEach(function(lib) {
      if (!app.config.versions[lib] || app.config.versions[lib] === 'latest') {
        promises.push(app.services.getLatestVersionOf(lib));
      } else {
        promises.push(new Promise(function(resolve) {
          resolve(app.config.versions[lib]);
        }));
      }
    });

    var newTab = window.open('', '_blank');
    newTab.document.write('Loading...');

    Promise.all(promises).then(
      function(iterable) {
        app.setVersion(libs[0], iterable[0]);
        if (iterable[1]) {
          app.setVersion(libs[1], iterable[1]);
        }

        var frameworkName = app.config.framework === 'vanilla' ? 'core' : state.framework;
        var title = app.util.capitalize(frameworkName) + ' | ' + app.util.capitalize(state.module) + ' issue: ';
        newTab.location.href = `https://github.com/OnsenUI/OnsenUI/issues/new?title=${title}&labels[]=${frameworkName}&labels[]=hasDemo&body=${app.services.generateIssueTemplate()}`;
      },
      function() {
        newTab.close();
      }
    );
  }
};

app.services.getLatestVersionOf = function (lib) {
  return app.util.request('https://registry.npmjs.org/' + lib, true)
  .then(
    function(responseText) {
      var responseJSON = JSON.parse(responseText);
      return responseJSON['dist-tags'].latest;
    },
    function() {
      console.warn('Request timed out.')
      return 'latest';
    });
};

app.services.generateIssueTemplate = function () {
  var frameworkInfo = '';
  var frameworkBindingsInfo = '';
  if (app.config.framework !== 'vanilla') {
    frameworkInfo = `
[Framework]
  ${app.config.framework} ${app.config.versions[app.config.framework || '']}
`;

    var frameworkLib = app.config.framework + '-onsenui';
    frameworkBindingsInfo = `
[Framework binding]
 ${frameworkLib} ${app.config.versions[frameworkLib]}
`;
  }

  var platformType = (/^(ios|android)/i).test(platform.os.family) ? 'Mobile' : 'Desktop';
  var platformInfo = platformType + ' - ' + platform.os.toString();
  var browserInfo = platformType + ' - ' + platform.description;
  var codeType = app.config.codeType;
  if (codeType === 'babel') {
    codeType = app.config.framework === 'react' ? 'jsx' : 'javascript';
  }

  return window.encodeURIComponent(`
__Environment__

  <!-- Modify if anything is wrong but keep the structure -->
\`\`\`
[Core]
  onsenui ${app.config.versions.onsenui}
  ${frameworkInfo}${frameworkBindingsInfo}
[Platform]
  ${platformInfo}

[Browser]
  ${browserInfo}
\`\`\`

__Encountered problem__
  <!-- Enter here the description  -->


__How to reproduce__
  <!-- Enter optional here the description  -->


  <!-- This link will work once the issue is created -->
  [__Demo link__](https://tutorial.onsen.io/?issue)

  <!-- Do not change the following code structure -->

- __HTML__

\`\`\`html
${app.editors.html.getValue()}
\`\`\`

- __JS__

\`\`\`${codeType}
${app.editors.js.getValue()}
\`\`\`

`);
};

app.services.generateAngular2Globals = function () {
  return `
    <!-- Data for Angular2 SystemJS -->
    <script>
      window._isLocalDev = ${app.config.local};
      window._onsNightlyBuild = ${app.config.nightly};
      window._onsAngular2LibVersion = '${app.config.versions['angular2-onsenui'] || ''}';
      window._angular2LibVersion = '${app.config.versions.angular2}'
    </script>
  `;
}
