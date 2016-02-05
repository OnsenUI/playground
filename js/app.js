var app = {
	lib: {
		js: {},
		css: {}
	},
	config: {},
  editors: {}
}

app.config.onsenRepo = 'OnsenUI/OnsenUI-dist';
app.config.onsenCdn = 'https://cdn.rawgit.com';

app.request = new XMLHttpRequest();
app.requestPromise = new Promise(function(resolve) {
  app.request.onload = function() {
    app.config.onsenVersion = JSON.parse(this.responseText)[0].name;
    resolve();
  };
});

app.requestPromise.then(function() {
  app.lib.js.onsenui = `${app.config.onsenCdn}/${app.config.onsenRepo}/${app.config.onsenVersion}/js/onsenui.min.js`;
  app.lib.js.angularOnsenui = `${app.config.onsenCdn}/${app.config.onsenRepo}/${app.config.onsenVersion}/js/angular-onsenui.min.js`;
  app.lib.css.onsenui = `${app.config.onsenCdn}/${app.config.onsenRepo}/${app.config.onsenVersion}/css/onsenui.css`;
  app.lib.css.onsenuiCssComponents = `${app.config.onsenCdn}/${app.config.onsenRepo}/${app.config.onsenVersion}/css/onsen-css-components.css`;

  app.outputTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>OnsenUI Tutorial</title>

      <script src="${app.lib.js.onsenui}"></script>

      <link rel="stylesheet" href="${app.lib.css.onsenui}">
      <link rel="stylesheet" href="${app.lib.css.onsenuiCssComponents}">

      <script>
        {{javascript}}
      </script>

    </head>

    <body>
      {{html}}
    </body>
    </html>
  `;
});


app.request.open('get', `https://api.github.com/repos/${app.config.onsenRepo}/tags`);
app.request.send();

app.splitPanes = function() {
  Split(['#leftPane', '#rightPane'], {
    gutterSize: 8,
    cursor: 'col-resize'
  });

  Split(['#leftTopPane', '#leftBottomPane'], {
    direction: 'vertical',
    sizes: [25, 75],
    gutterSize: 8,
    cursor: 'row-resize'
  });

  Split(['#rightTopPane', '#rightBottomPane'], {
    direction: 'vertical',
    sizes: [25, 75],
    gutterSize: 8,
    cursor: 'row-resize'
  });
}

app.run = function() {
  window.sessionStorage.setItem('editorHtmlContent', app.editors.html.getValue());
  window.sessionStorage.setItem('editorJsContent', app.editors.js.getValue());
	app.output.srcdoc = app.outputTemplate
    .replace('{{html}}', app.editors.html.getValue())
    .replace('{{javascript}}', app.editors.js.getValue());
};

app.codepenSubmit = function() {
	document.body.querySelector('#codepen-data').value = JSON.stringify({
    title: 'Onsen UI',
    description: 'Onsen UI Tutorial Export',
    html:  app.editors.html.getValue(),
    js: app.editors.js.getValue(),
    editors: '101',
    js_external: `${app.lib.js.onsenui}`,
    css_external: `${app.lib.css.onsenui};${app.lib.css.onsenuiCssComponents}`
	});
};

app.createEditor = function(id, language) {
    var editor = ace.edit(id);
    editor.setTheme("ace/theme/chrome");
    editor.session.setMode("ace/mode/" + language);
    editor.$blockScrolling = Infinity;
    editor.setOptions({
      fontSize: "10pt",
      fontFamily: "hermit",
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: false

    });

    return editor;
};

window.onkeydown = function(e){
  if(e.ctrlKey && e.keyCode == 'S'.charCodeAt(0)){
    e.preventDefault();
    app.run();
  }
};

document.addEventListener("DOMContentLoaded", function() {
  app.splitPanes();

  app.output = document.body.querySelector('#output iframe');

  ace.require("ace/ext/language_tools");
  app.editors.html = app.createEditor('html-input', 'html');
  app.editors.html.setValue(window.sessionStorage.getItem('editorHtmlContent') || '<p style="text-align: center;">Run your project!</p>');
  app.editors.js = app.createEditor('js-input', 'javascript');
  app.editors.js.setValue(window.sessionStorage.getItem('editorJsContent') || 'console.log(\'Run your project!\')');

  document.querySelector('#codepen-form').onsubmit = app.codepenSubmit;
  document.querySelector('#run').onclick = app.run;

  app.requestPromise.then(app.run);
});
