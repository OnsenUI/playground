var app = {
	lib: {
		js: {},
		css: {}
	},
	config: {},
  editors: {},
  util: {}
};

app.util = {
  getParam: function(param) {
    var regex = new RegExp(param + '=([\\w- ]+)');
    var query = window.location.search.replace(/\+|%20/, ' ');
    return ((query.match(regex) || [])[1] || '');
  },
  arrayFrom: function(arrayLike) {
    return Array.prototype.slice.call(arrayLike);
  },
  resize: {
    lock: null,
    throttler: function() {
      if (!app.util.resize.lock) {
        app.util.resize.lock = setTimeout(function() {
          app.util.resize.lock = null;
          app.util.resize.handler();
         }, 50);
      }
    },
    handler: function() {
      app.editors.js.resize();
      app.editors.html.resize();
    }
  }
};

app.config.onsenRepo = 'OnsenUI/OnsenUI-dist';
app.config.onsenCdn = 'https://cdn.rawgit.com';
app.config.platform = 'android';

app.request = new XMLHttpRequest();
app.requestPromise = new Promise(function(resolve) {
  app.request.onload = function() {
    var response = JSON.parse(this.responseText)[0];
    if (response) {
      app.config.onsenVersion = response.name;
    }else {
      console.warn('Could not fetch Onsen UI versions. Github\'s API rate limit exceeded.');
      app.config.onsenVersion = '2.0.0-beta.7';
    }

    console.info('Using OnsenUI', app.config.onsenVersion);
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

app.showWelcomeMessage = function() {
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
  app.selectList.children[0].selected = true;
};

app.splitPanes = function() {
  Split(['#leftPane', '#rightPane'], {
    gutterSize: 15,
    sizes: [30, 70],
    minSize: 250,
    cursor: 'col-resize'
  });

  Split(['#leftTopPane', '#leftBottomPane'], {
    direction: 'vertical',
    sizes: [40, 60],
    gutterSize: 15,
    cursor: 'row-resize'
  });

  Split(['#rightTopPane', '#rightBottomPane'], {
    direction: 'vertical',
    sizes: [50, 50],
    minSize: 140,
    gutterSize: 15,
    cursor: 'row-resize',
    onDrag: app.util.resize.handler
  });

  document.querySelector('#leftPane').style.width = 'calc(30% - 7.5px)';
  document.querySelector('#rightPane').style.width = 'calc(70% - 7.5px)';
}

app.runProject = function() {
  window.sessionStorage.setItem('editorHtmlContent', app.editors.html.getValue());
  window.sessionStorage.setItem('editorJsContent', app.editors.js.getValue());
  document.querySelector('#output iframe').srcdoc = app.outputTemplate()
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
    editor.setTheme('ace/theme/monokai');
    editor.session.setMode("ace/mode/" + language);
    editor.session.setTabSize(2);
    editor.session.setUseSoftTabs(true);
    editor.renderer.setShowGutter(window.Split);
    editor.$blockScrolling = Infinity;
    editor.setOptions({
      fontSize: '10pt',
      fontFamily: 'hermit',
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: false,
      showPrintMargin: false

    });

    return editor;
};

app.toggleTheme = function() {
  document.body.classList.toggle('dark-skin');
  Object.keys(app.editors).forEach(function(editor) {
    app.editors[editor].setTheme('ace/theme/' + (document.body.classList.contains('dark-skin') ? 'monokai' : 'chrome'));
  });
};

app.pagesCounterSetup  = function() {
  document.getElementById('pages-previous').onclick = function() {
    if (app.tutorial && app.tutorial.pageIndex > 0) {
      app.tutorial.pageIndex--;
      document.getElementById('pages-current').innerHTML = app.tutorial.pageIndex + 1;
      document.getElementById('tutorial-content').innerHTML = app.tutorial.pages[app.tutorial.pageIndex];
    }
  };

  document.getElementById('pages-next').onclick = function() {
    if (app.tutorial && app.tutorial.pageIndex < app.tutorial.pages.length - 1) {
      app.tutorial.pageIndex++;
      document.getElementById('pages-current').innerHTML = app.tutorial.pageIndex + 1;
      document.getElementById('tutorial-content').innerHTML = app.tutorial.pages[app.tutorial.pageIndex];
    }
  };
};

app.tabViewSetup = function() {
  var activeTabIndex = app.util.getParam('tab-active');
  var visibleTabs = app.util.getParam('tab-visibility');

  if (activeTabIndex) {
    var activeTab = document.querySelector('#tab-' + activeTabIndex);
    if (activeTab) {
      activeTab.checked = true;
    }
  }

  if (visibleTabs) {
    for (var i = 1; i <= 4; i++) {
      document.querySelector('#tab-' + i).parentElement.children[1].style.display = (+ visibleTabs[i - 1]) ? '' : 'none';
    }
  }
};

app.toolbarSetup = function() {
  document.querySelector('#skin').onclick = app.toggleTheme;
};

window.onkeydown = function(e){
  if(e.ctrlKey && e.keyCode == 'S'.charCodeAt(0)){
    e.preventDefault();
    app.runProject();
  }
};

window.onload = function() {
  var placeholder = document.body.querySelector('#placeholder');
  if (placeholder) {
    placeholder.remove();
  }
};

window.onresize = app.util.resize.throttler;

window.onpopstate = function(event) {
  if (event.state) {
    app.modules.change(event.state.module, event.state.part).then(app.runProject);
  } else {
    app.showWelcomeMessage();
  }
};

document.addEventListener("DOMContentLoaded", function() {

  // General setup
  document.body.classList.add('dark-skin');
  if (window.Split) {
    app.splitPanes();
    app.modules.setup();
    app.toolbarSetup();
  } else {
    app.tabViewSetup();
  }
  var module = app.util.getParam('module');
  var part = app.util.getParam('part');
  if (module && part) {
    app.modules.change(module, part);
  }

  // Editors setup
  ace.require("ace/ext/language_tools");
  app.editors.html = app.createEditor('html-input', 'html');
  app.editors.html.setValue(window.sessionStorage.getItem('editorHtmlContent') || '<p style="text-align: center;">Run your project!</p>', -1);
  app.editors.js = app.createEditor('js-input', 'javascript');
  app.editors.js.setValue(window.sessionStorage.getItem('editorJsContent') || 'console.log(\'Run your project!\')', -1);

  // Preview setup
  app.switchStyle();
  app.requestPromise.then(app.runProject);
  document.body.querySelector('#codepen-form').onsubmit = app.codepenSubmit;
  document.body.querySelector('#run').onclick = app.runProject;
  document.body.querySelector('#styling button').onclick = function() {
    app.switchStyle();
    app.runProject();
  };

  // Tutorial setup
  app.pagesCounterSetup();
  if (!module || !part) {
    app.showWelcomeMessage();
  }

});
