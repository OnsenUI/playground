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
      <link href='https://fonts.googleapis.com/css?family=Roboto:400,300italic,300,500,400italic,500italic,700,700italic' rel='stylesheet' type='text/css'>

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
## Welcome!

![onsen](assets/icons/logo_onsenui.svg)

This is the Onsen UI Interactive Tutorial. Select a module to display a new sample application with its description.

  * In the preview section you can switch between iOS and Android view for Automatic Styling.

  * If you want to save any of these examples you can export the code to Codepen or generate a Cordova project and download it.

  * Press 'ctrl + s' to quickly refresh the preview.

We hope you find this helpful! You can ask anything in the [community forum](https://community.onsen.io) if you have issues.

` ;

  document.getElementById('pages-current').innerHTML = 1;
  document.getElementById('pages-total').innerHTML = 1;
  document.getElementById('tutorial-content').innerHTML = marked(message);
  app.tutorial = {
    pageIndex: 0,
    pages: 1
  };
};


app.services.runProject = function() {
  window.sessionStorage.setItem('editorHtmlContent', app.editors.html.getValue());
  window.sessionStorage.setItem('editorJsContent', app.editors.js.getValue());
  window.sessionStorage.setItem('ons-framework', app.config.framework);

  document.querySelector('#output iframe').srcdoc = app.services.generateTemplateOutput();
};

app.services.codepenSubmit = function() {
  document.querySelector('#codepen-data').value = JSON.stringify({
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

app.services.switchStyle = function(platform) {
  app.config.platform = platform;
};

app.services.toggleTheme = function() {
  document.body.classList.toggle('dark-skin');
  window.localStorage[window.localStorage.getItem('onsDarkSkin') ? 'removeItem' : 'setItem']('onsDarkSkin', 'true');
  Object.keys(app.editors).forEach(function(editor) {
    app.editors[editor].setTheme('ace/theme/' + ((document.body.classList.contains('dark-skin')) ? 'monokai' : 'chrome'));
  });
};

app.services.changeModule = function(framework, category, module) {
  window.history.pushState({
    framework: framework,
    category: category,
    module: module
  }, '', '?framework=' + framework + '&category=' + category.replace(/\s/g, '%20') + '&module=' + module.replace(/\s/g, '%20'));

  return app.services.loadModule(framework, category, module);
};

app.services.loadModule = function(framework, category, module) {
  return app.util.request(module ? `./tutorial/${framework}/${category.replace(/\s/g, '_')}/${module.replace(/\s/g, '_')}.html` : framework)
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

      app.tutorial = {
        pageIndex: 0,
        pages: docs.split(/\n(?=[ \t]*#{2}(?!#))/).map(function(e) {
          return marked(e);
        })
      };

      document.querySelector('#pages-current').innerHTML = app.tutorial.pageIndex + 1;
      document.querySelector('#pages-total').innerHTML = app.tutorial.pages.length;
      app.services.updateTutorialPage();
    })
    .catch(function(err) {
      console.error(err.message);
    });
};

app.services.updateDropdown = function(framework, category, module) {
  app.services.updateSelectedItem(framework, module);
  category = app.util.parseId(category);
  module = app.util.parseId(module);
  document.querySelector('#r-' + framework).checked = true;
  document.querySelector('#c-' + framework + '-' + category).checked = true;
  document.querySelector('#r-' + framework + '-' + category + '-' + module).checked = true;
};

app.services.updateSelectedItem = function(framework, module) {
  if (window.Split) {
    var description = document.querySelector('label[module="' + module + '"]').getAttribute('desc');
    document.querySelector('#modules .select-item').innerHTML = description;
    var thumbnail = document.querySelector('#modules .select-thumbnail');
    thumbnail.setAttribute('class', 'select-thumbnail ' + (framework ? (framework + '-thumbnail') : ''));
  }
};

app.services.transpile = function(code) {
  switch (app.services.detectTranspiler()) {
    case 'babel':
      var result;
      try {
        result = Babel.transform(code, { presets: ['react'] }).code;
      } catch(e) {
        var msg = e.message
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        result = `
          setTimeout(function() {
            document.body.setAttribute('style', 'color: red; margin: 8px; font-family: Arial');
            document.body.innerHTML = \`<pre>${msg}</pre>\`;
          }, 0);
        `;
      }
      return result;
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
        'react': [app.config.lib[position].js.react, app.config.lib[position].js.reactDom],
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

app.services.addTranspilerDependencies = function(packageJSON) {
  switch (app.services.detectTranspiler()) {
    case 'babel':
      packageJSON = app.util.addEntry(packageJSON, 'devDependencies', app.config.npm.babel[0], true);
      packageJSON = app.util.addEntry(packageJSON, 'devDependencies', app.config.npm.babel[1], false);

      packageJSON = app.util.addEntry(packageJSON, 'scripts', '"build": "babel www/js/app.jsx -o www/js/app.js"', true);
      packageJSON = app.util.addEntry(packageJSON, 'scripts', '"watch": "babel www/js/app.jsx --watch -o www/js/app.js"', false);

      packageJSON = packageJSON.replace(/\}\s*\}[\s]*$/, '},\n  "babel": {\n\n  }\n}');
      packageJSON = app.util.addEntry(packageJSON, 'babel', '"presets": ["react"]', true);
      break;
  }

  return packageJSON;
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

    packageJSON = app.util.addEntry(packageJSON, 'dependencies', app.config.npm.onsenui, true);
    if (app.config.npm.hasOwnProperty(app.config.framework)) {
      app.config.npm[app.config.framework].forEach(function(dep) {
        packageJSON = app.util.addEntry(packageJSON, 'dependencies', dep);
      });

      packageJSON = app.services.addTranspilerDependencies(packageJSON);
    }
    zip.file('package.json', packageJSON);


    // EXTERNAL LIBRARIES
    var promises = [];
    var externalLibraries = app.services.detectLibraries();
    var addLib = function(lib) {
      if (externalLibraries.hasOwnProperty(lib)) {
        Object.keys(externalLibraries[lib]).forEach(function(dir) {
          externalLibraries[lib][dir].forEach(function(file) {
            promises.push(app.util.request(file)
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

        var title = document.querySelector('#modules .select-item').innerHTML.replace(/\s+/g, '_');
        if (title === 'Select_Tutorial') {
          title = 'OnsenUI-Project.zip';
        }

        window.saveAs(zip.generate({type: 'blob'}), `${title}.zip`);
      })
      .catch(function(err) {
        alert('Could not generate Cordova project.')
        console.error(err.message);
      });
  });
};

app.services.updateTutorialPage = function() {
  var tutorialContent = document.querySelector('#tutorial-content');
  tutorialContent.innerHTML = app.tutorial.pages[app.tutorial.pageIndex];
  tutorialContent.scrollTop = 0;
};

app.services.refreshSplit = function() {
  var mousedown = new CustomEvent('mousedown');
  var mousemove = new CustomEvent('mousemove', {bubbles: true});
  var mouseup = new CustomEvent('mouseup', {bubbles: true});
  var gutter = document.querySelector('.gutter-horizontal');

  mousemove.clientX = gutter.getBoundingClientRect().left;

  gutter.dispatchEvent(mousedown);
  gutter.dispatchEvent(mousemove);
  gutter.dispatchEvent(mouseup);
};
