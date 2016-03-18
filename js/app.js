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
app.config.platform = 'android';

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
});


app.request.open('get', `https://api.github.com/repos/${app.config.onsenRepo}/tags`);
app.request.send();

app.outputTemplate = function() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>OnsenUI Tutorial</title>

      <script src="${app.lib.js.onsenui}"></script>
      <script>
        ons.platform.select('${app.config.platform}');
      </script>

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
};

app.welcomeMessage = `
## Welcome

This is the Onsen UI Interactive Tutorial. Select a module and blah blah...

  * In the preview section you can switch between iOS and Android view for Automatic Styling.

  * If you want to save any of these examples you export the code to Codepen.

  * Press 'ctrl + s' to quickly refresh the preview.


This is the Onsen UI Interactive Tutorial. Select a module and blah blah...

![onsen](assets/icons/onsenui.svg)

`;

app.splitPanes = function() {
  Split(['#leftPane', '#rightPane'], {
    gutterSize: 10,
    sizes: [30, 70],
    minSize: 250,
    cursor: 'col-resize'
  });

  Split(['#leftTopPane', '#leftBottomPane'], {
    direction: 'vertical',
    sizes: [40, 60],
    gutterSize: 10,
    cursor: 'row-resize'
  });

  Split(['#rightTopPane', '#rightBottomPane'], {
    direction: 'vertical',
    sizes: [50, 50],
    gutterSize: 10,
    cursor: 'row-resize',
    onDrag: function() {
      app.editors.js.resize();
      app.editors.html.resize();
    }
  });
}

app.runProject = function() {
  window.sessionStorage.setItem('editorHtmlContent', app.editors.html.getValue());
  window.sessionStorage.setItem('editorJsContent', app.editors.js.getValue());
  app.output.srcdoc = app.outputTemplate()
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

app.switchStyle = function() {
  var buttonIcon = document.querySelector('#styling-icon');
  var buttonLabel = document.querySelector('#styling-label');
  if (app.config.platform === 'android') {
    app.config.platform = 'ios';
    buttonLabel.innerHTML = 'ios';
    buttonIcon.classList.remove('icon-android');
    buttonIcon.classList.add('icon-ios');

  } else {
    app.config.platform = 'android';
    buttonLabel.innerHTML = 'android';
    buttonIcon.classList.remove('icon-ios');
    buttonIcon.classList.add('icon-android');
  }
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
    app.runProject();
  }
};

document.addEventListener("DOMContentLoaded", function() {
  app.splitPanes();
  app.switchStyle();
  app.modulesSetup();

  app.output = document.body.querySelector('#output iframe');

  ace.require("ace/ext/language_tools");
  app.editors.html = app.createEditor('html-input', 'html');
  app.editors.html.setValue(window.sessionStorage.getItem('editorHtmlContent') || '<p style="text-align: center;">Run your project!</p>', -1);
  app.editors.js = app.createEditor('js-input', 'javascript');
  app.editors.js.setValue(window.sessionStorage.getItem('editorJsContent') || 'console.log(\'Run your project!\')', -1);

  document.body.querySelector('#tutorial-content').innerHTML = markdown.toHTML(app.welcomeMessage);
  document.body.querySelector('#codepen-form').onsubmit = app.codepenSubmit;
  document.body.querySelector('#run').onclick = app.runProject;
  document.body.querySelector('#styling button').onclick = function() {
    app.switchStyle();
    app.runProject();
  };

  app.requestPromise.then(app.runProject);
});

window.onload = function() {
  document.body.querySelector('#placeholder').style.display = 'none';
};
