app.services = {};

app.services.generateTemplateOutput = function() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>OnsenUI Tutorial</title>

      ${app.services.generateTemplateFromLibs()}

      <script>
        ons.platform.select('${app.config.platform}');
      </script>

      ${app.services.generateTemplateCSS()}

      <script>
        ${app.services.transpile(app.editors.js.getValue())}
      </script>

    </head>

    <body>
      ${app.editors.html.getValue()}
    </body>
    </html>
  `;
};

app.services.generateTemplateFromLibs = function(position) {
  var libs = app.util.flattenJSLibs(app.services.detectLibraries(position));
  var result = '';

  libs.forEach(function(lib) {
    result += `\n  <script src="${lib}"></script>`
  });

  return result;
}

app.services.generateTemplateCSS = function(position) {
  position = position || 'remote';
  return `
  <link rel="stylesheet" href="${app.config.lib[position].css.onsenui}">
  <link rel="stylesheet" href="${app.config.lib[position].css.onsenuiCssComponents}">`;
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
  window.sessionStorage.setItem('ons-framework', app.config.framework);

  document.querySelector('#output iframe').srcdoc = app.services.generateTemplateOutput();
};

app.services.codepenSubmit = function() {
  document.body.querySelector('#codepen-data').value = JSON.stringify({
    title: 'Onsen UI',
    description: 'Onsen UI Tutorial Export',
    html:  app.editors.html.getValue(),
    js: app.editors.js.getValue(),
    editors: '101',
    js_external: app.util.flattenJSLibs(app.services.detectLibraries()).join(';'),
    css_external: app.config.lib.remote.css.onsenui + ';' + app.config.lib.remote.css.onsenuiCssComponents,
    js_pre_processor: app.services.detectTranspiler()
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

  return app.services.loadModule(module, part);
};

app.services.loadModule = function(module, part) {
  return app.util.requestFile(part ? `./tutorial/${module.replace(/\s/g, '_')}/${part.replace(/\s/g, '_')}.html` : module)
    .then(function(responseText) {
      var format = app.util.format,
        extract = app.util.extract;

      var html = format(extract(responseText, /<body>([\s\S]*)<\/body>/));
      var docs = extract(responseText, /<\/html>\s*<!--.*\n([\s\S]*)-->/).trim();
      var script = extract(responseText, /<head>[\s\S]*(<script[\s\S]*<\/script>)[\s\S]*<\/head>/);
      var code = format(extract(script, /<script.*>([\s\S]*)<\/script>/));

      app.editors.html.setValue(html, -1);
      app.editors.js.setValue(code, -1);

      var rawTranspiler = (format(extract(script, /^<script\s*type="text\/([\w-]+)"\s*>/)) || 'javascript').toLowerCase();
      app.services.detectFramework(rawTranspiler, code);

      app.services.updateEditors();
      app.services.updateCategory(part ? module : null);

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
    })
    .catch(function(err) {
      console.error(err.message);
    });
};

app.services.transpile = function(code) {
  switch (app.services.detectTranspiler()) {
    case 'babel':
      return Babel.transform(code, { presets: ['react'] }).code;
    case 'none':
    default:
      return code;
  }
};

app.services.updateEditors = function() {
  var editorTitle = window.Split ? document.querySelector('#rightBottomPane .editor-title') : document.querySelector('label[for="tab-2"]');
  switch (app.services.detectTranspiler()) {
    case 'babel':
      editorTitle.innerHTML = 'JSX';
      app.editors.js.session.setMode('ace/mode/jsx');
      break;
    default:
      editorTitle.innerHTML = 'JS';
      app.editors.js.session.setMode('ace/mode/javascript');
  }
};

app.services.updateCategory = function(module) {
  if (window.Split) {
    document.querySelector('#module-title-text').innerHTML = (module || 'Welcome!');
  }
};

app.services.loadFrameworkLib = function(position) {
  switch (app.config.framework) {
    case 'react':
      return app.services.generateTemplate.react(position);
    case 'angular':
      return app.services.generateTemplate.angular(position);
    case 'vanilla':
    default:
      return '';
  }
};

app.services.detectLibraries = function(position) {
  position = position || 'remote';
  var libs = {
    'onsenui': {
      'onsen/js': [app.config.lib[position].js.onsenui],
      'onsen/css': [app.config.lib[position].css.onsenui, app.config.lib[position].css.onsenuiCssComponents]
    }
  };

  switch (app.config.framework) {
    case 'react':
      libs.react = {
        'react': [app.config.lib[position].js.react, app.config.lib[position].js.reactDom, app.config.lib[position].js.reactDomServer],
        'react-onsenui': [app.config.lib[position].js.reactOnsenui]
      }
      break;
    case 'angular':
      libs.angular = {
        'angular': [app.config.lib[position].js.angular],
        'onsen/js': [app.config.lib[position].js.angularOnsenui]
      }
      break;
  }

  return libs;
};

app.services.nextTutorial = function() {
  if (app.selectList.selectedIndex < app.selectList.length - 1) {
    app.selectList.selectedIndex += 1;
    app.services.changeModule().then(app.services.runProject);
  }
};

app.services.detectFramework = function(rawTranspiler, code) {
  switch (rawTranspiler) {
    case 'jsx':
    case 'babel':
    case 'react':
      app.config.framework = 'react';
      break;
    default:
      app.config.framework = (code.match(/ons\.bootstrap/) || code.match(/angular\.module/)) ? 'angular' : 'vanilla';
  }
};

app.services.detectTranspiler = function() {
  switch (app.config.framework) {
    case 'react':
      return 'babel';
    default:
      return 'none';
  }
};

app.services.showGenerateModal = function() {
  document.querySelector('#modal').classList.remove('generating');
  document.querySelector('#modal-container').classList.add('visible');
};


app.services.hideGenerateModal = function() {
  document.querySelector('#modal-container').classList.remove('visible');
};

app.services.generateCordovaProject = function() {
  document.querySelector('#modal').classList.add('generating');

  JSZipUtils.getBinaryContent('./project-template.zip', function(err, data) {
    if (err) {
      throw new Error(err);
    }

    var token = {
      body: '<!-- App layout -->\n',
      css: '<!-- CSS dependencies -->',
      js: '<!-- JS dependencies -->'
    };

    // ZIP FILE
    var zip = new JSZip(data);

    // INDEX.HTML
    var indexHTML = zip.file('www/index.html').asText();
    indexHTML = indexHTML
      .replace(token.body, token.body + app.editors.html.getValue().split('\n').map(function(line) {return line ? ('  ' + line) : line;}).join('\n'))
      .replace(token.css, token.css + app.services.generateTemplateCSS('local'))
      .replace(token.js, token.js + app.services.generateTemplateFromLibs('local'));
    zip.file('www/index.html', indexHTML);

    // APP.JS
    if (app.config.framework === 'react') {
      zip.file('www/js/app.js', app.services.transpile(app.editors.js.getValue()));
      zip.file('www/js/app.jsx', app.editors.js.getValue());
    } else {
      zip.file('www/js/app.js', app.editors.js.getValue());
    }

    // PACKAGE.JSON
    var packageJSON = zip.file('package.json').asText();
    var addDependency = function (dep, first) {
      return packageJSON.replace(/("dependencies": \{\n(?:.|[\r\n])*?)(\n\s+\})/, '$1' + (first ? '' : ',\n') + '    ' + dep + '$2')
    };
    packageJSON = addDependency(app.config.npm.onsenui, true);
    if (app.config.npm.hasOwnProperty(app.config.framework)) {
      app.config.npm[app.config.framework].forEach(function(dep) {
        packageJSON = addDependency(dep);
      });
    }
    zip.file('package.json', packageJSON);


    // EXTERNAL LIBRARIES
    var promises = [];
    var externalLibraries = app.services.detectLibraries();
    var addLib = function(lib) {
      if (externalLibraries.hasOwnProperty(lib)) {
        Object.keys(externalLibraries[lib]).forEach(function(dir) {
          externalLibraries[lib][dir].forEach(function(file) {
            promises.push(app.util.requestFile(file)
              .then(function(res) {
                zip.file(`www/lib/${dir}/${file.split('/').pop()}`, res);
              })
            );
          });
        });
      }
    };
    addLib('onsenui');
    addLib(app.config.framework);


    // GENERATE AND DOWNLOAD
    Promise.all(promises)
      .then(function() {
        console.info('Done!');
        app.services.hideGenerateModal();
        var title = 'OnsenUI-Project.zip';
        if (app.selectList.selectedIndex) {
          var part = app.selectList[app.selectList.selectedIndex].label.replace(/\s+/g, '_');
          var module = app.selectList[app.selectList.selectedIndex].parentElement.label.replace(/\s+/g, '_');
          title = `${module}-${part}.zip`;
        }

        window.saveAs(zip.generate({type: 'blob'}), `${module}-${part}.zip`);
      })
      .catch(function(err) {
        alert('Could not generate Cordova project.')
        console.error(err.message);
      });
  });
};