app.services = {};

app.services.outputTemplate = function() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>OnsenUI Tutorial</title>

      <script src="${app.config.lib.js.onsenui}"></script>
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

  document.body.querySelector('#tutorial-content').innerHTML = markdown.toHTML(message);
};


app.services.runProject = function() {
  window.sessionStorage.setItem('editorHtmlContent', app.editors.html.getValue());
  window.sessionStorage.setItem('editorJsContent', app.editors.js.getValue());
  document.querySelector('#output iframe').srcdoc = app.services.outputTemplate()
    .replace('{{html}}', app.editors.html.getValue())
    .replace('{{javascript}}', app.editors.js.getValue());
};

app.services.codepenSubmit = function() {
  document.body.querySelector('#codepen-data').value = JSON.stringify({
    title: 'Onsen UI',
    description: 'Onsen UI Tutorial Export',
    html:  app.editors.html.getValue(),
    js: app.editors.js.getValue(),
    editors: '101',
    js_external: `${app.config.lib.js.onsenui}`,
    css_external: `${app.config.lib.css.onsenui};${app.config.lib.css.onsenuiCssComponents}`
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
  Object.keys(app.editors).forEach(function(editor) {
    app.editors[editor].setTheme('ace/theme/' + (document.body.classList.contains('dark-skin') ? 'monokai' : 'chrome'));
  });
};

app.services.changeModule = function(module, part) {
  var extract = function(string, regex) {
    return ((string.match(regex) || [])[1] || '');
  };

  var format = function(code) {
    var indentation = extract(code, /([\t ]*)\S/);
    code = code.trim();

    if (indentation) {
      code = code.replace(new RegExp('^' + indentation, 'gm'), '');
    }

    return code;
  };

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

      var html = format(extract(this.responseText, /<body>([\s\S]*)<\/body>/));
      var js = format(extract(this.responseText, /<head>[\s\S]*<script>([\s\S]*)<\/script>[\s\S]*<\/head>/));
      var docs = extract(this.responseText, /<\/html>\s*<!--.*\n([\s\S]*)-->/).trim();

      app.tutorial = {
        pageIndex: 0,
        pages: docs.split(/\n(?=[ \t]*#{2}(?!#))/).map(function(e) {
          return markdown.toHTML(e);
        })
      };

      app.editors.html.setValue(html, -1);
      app.editors.js.setValue(js, -1);

      document.getElementById('pages-current').innerHTML = app.tutorial.pageIndex + 1;
      document.getElementById('pages-total').innerHTML = app.tutorial.pages.length;
      document.getElementById('tutorial-content').innerHTML = app.tutorial.pages[0];

      resolve();
    };

    request.open('get', `./tutorial/${module.replace(/\s/g, '_')}/${part.replace(/\s/g, '_')}.html`);
    request.send();
  });
};
