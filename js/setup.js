/* globals app, Split, ace */
app.setup = {};

app.setup.splitPanes = function () {
  app.splits = {};
  var vw = window.innerWidth;
  var demoWidth = Math.ceil(331 * 100 / vw);

  if (!app.config.compact) { // Full View
    app.splits.main = Split(['#leftPane', '#rightPane'], {
      gutterSize: 15,
      sizes: [demoWidth, 100 - demoWidth],
      minSize: [301, 0],
      cursor: 'col-resize',
      onDrag: app.util.resize.editorResize
    });

    app.splits.docsDemo = Split(['#leftTopPane', '#leftBottomPane'], {
      direction: 'vertical',
      sizes: [40, 60],
      minSize: 0,
      gutterSize: 15,
      cursor: 'row-resize'
    });
  } else { // Compact View
    app.config.showDocs = app.util.getParam('docs') !== 'false';

    if (app.config.showDocs) {
      app.splits.main = Split(['#leftPane', '#centerPane', '#rightPane'], {
        gutterSize: 15,
        sizes: [25, demoWidth, 100 - 25 - demoWidth],
        minSize: [1, 301, 0],
        cursor: 'col-resize',
        onDrag: app.util.resize.editorResize
      });
    } else {
      document.querySelector('#leftPane').style.display = 'none';
      app.splits.main = Split(['#centerPane', '#rightPane'], {
        gutterSize: 15,
        sizes: [demoWidth, 100 - demoWidth],
        minSize: [301, 0],
        cursor: 'col-resize',
        onDrag: app.util.resize.editorResize
      });
    }
  }

  app.splits.editors = Split(['#rightTopPane', '#rightBottomPane'], {
    direction: 'vertical',
    sizes: [50, 50],
    minSize: 0,
    gutterSize: 15,
    cursor: 'row-resize',
    onDrag: app.util.resize.editorResize
  });

  var rememberDrag = function(event) {
    app.config.autoHideHTMLPane = false;
    event.target.removeEventListener('click', rememberDrag);
  };

  document.querySelector('#rightPane .gutter-vertical').addEventListener('click', rememberDrag);
};

app.setup.editor = function (id, language) {
  var editor = ace.edit(id);
  editor.setTheme('ace/theme/' + (document.body.classList.contains('dark-skin') ? 'monokai' : 'chrome'));
  editor.session.setMode("ace/mode/" + language);
  editor.session.setTabSize(2);
  editor.session.setUseSoftTabs(true);
  editor.renderer.setShowGutter(!!window.Split);
  editor.container.style.lineHeight = 1.3;
  editor.$blockScrolling = Infinity;
  editor.setOptions({
    fontSize: '10pt',
    fontFamily: 'hermit',
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: false,
    showPrintMargin: false,
    enableEmmet: true
  });

  editor.session.on("changeAnnotation", function() {
    var annotations = editor.session.getAnnotations() || [];
    var len = annotations.length;
    var i = annotations.length;

    while (i--) {
      var a = annotations[i].text;
      if ((/doctype first\. Expected/).test(a) ||
        (/Unexpected End of file\. Expected/).test(a)) {
        annotations.splice(i, 1);
      }
    }

    if (len > annotations.length) {
      editor.session.setAnnotations(annotations);
    }
  });

  return editor;
};

app.setup.pagesCounter = function () {
  document.getElementById('pages-previous').onclick = function () {
    if (app.tutorial && app.tutorial.pageIndex > 0) {
      app.tutorial.pageIndex--;
      document.getElementById('pages-current').innerHTML = app.tutorial.pageIndex + 1;
      app.services.updateTutorialPage();
    }
  };

  document.getElementById('pages-next').onclick = function () {
    if (app.tutorial && app.tutorial.pageIndex < app.tutorial.pages.length - 1) {
      app.tutorial.pageIndex++;
      document.getElementById('pages-current').innerHTML = app.tutorial.pageIndex + 1;
      app.services.updateTutorialPage();
    }
  };
};

app.setup.tabView = function () {
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
      document.querySelector('#tab-' + i).parentElement.children[1].style.display = (+visibleTabs[i - 1]) ? '' : 'none';
    }
  }

  // var mainViewLink = document.querySelector('.main-view-link a');
  // mainViewLink.setAttribute('href', window.location.href.replace('/tabs.html', '/index.html'));
};

app.setup.toolbar = function () {
  document.querySelector('#codepen-form').onsubmit = app.services.codepenSubmit;
  document.querySelector('#modify-button').onclick = app.services.modifySource;
  document.querySelector('#issue-button').onclick = app.services.reportIssue;
};

app.setup.modules = function () {
  var frameworkItems = Array.prototype.slice.call(document.body.querySelectorAll('.framework-item'));

  frameworkItems.forEach(function (frameworkItem) {
    var framework = frameworkItem.querySelector('label').getAttribute('framework');
    var moduleList = frameworkItem.querySelector('.module-list');

    if (app.modules.hasOwnProperty(framework)) {
      Object.keys(app.modules[framework]).forEach(function (category, index) {
        var id = `c-${framework}-${app.util.parseId(category)}`;
        var categoryItem = document.createElement('li');
        categoryItem.classList.add('category-item');

        categoryItem.innerHTML = `
          <input type="checkbox" id="${id}" ${index === 0 ? 'checked' : ''}>
          <label for="${id}" category="${category}"></label>
        `;

        var listElement = document.createElement('ul');

        Object.keys(app.modules[framework][category]).forEach(function (module) {
          var id = `r-${framework}-${app.util.parseId(category)}-${app.util.parseId(module)}`;
          var moduleItem = document.createElement('li');
          moduleItem.classList.add('module-item');
          var itemContent = app.modules[framework][category][module].split('|');
          moduleItem.innerHTML = `
            <input type="radio" name="select-item" id="${id}">
            <label for="${id}" module="${module}" desc="${itemContent[0]}" keywords="${itemContent[1] || ''}"></label>
          `;
          listElement.appendChild(moduleItem)
        });

        categoryItem.appendChild(listElement);
        moduleList.appendChild(categoryItem);
      });

      if (moduleList.querySelectorAll('li').length) {
        var extraInfo = document.createElement('li');
        extraInfo.classList.add('category-item');
        extraInfo.innerHTML = `
          <a href="https://onsen.io/v2/docs/${framework === 'vanilla' ? 'js' : framework}.html">Further reading</a>
        `;
        moduleList.appendChild(extraInfo);
      } else {
        var comingSoon = document.createElement('div');
        comingSoon.classList.add('coming-soon');
        comingSoon.innerHTML = 'Coming soon ™';
        moduleList.appendChild(comingSoon);
      }
    }

    document.body.querySelector('#modules').onchange = function (event) {
      if (event.target.name === 'select-item') {
        var el = event.target;
        var framework = el.parentElement.parentElement.parentElement.parentElement.previousElementSibling.getAttribute('framework');
        var category = el.parentElement.parentElement.previousElementSibling.getAttribute('category');
        var module = el.nextElementSibling.getAttribute('module');

        app.services.changeModule(framework, category, module).then(app.services.runProject);
        app.services.updateSelectedItem(framework, module);
        document.body.querySelector('#modules input').checked = false;
      }
    };

    document.body.querySelector('#search-input').oninput = function(event) {
      var v = event.target.value;
      if (event.target.value) {
        Array.prototype.forEach.call(document.querySelectorAll(`#modules .module-item label:not([keywords*="${v}" i]):not([module*="${v}" i]):not([desc*="${v}" i])`), function(e) {
          e.style.display = 'none';
        });

        Array.prototype.forEach.call(document.querySelectorAll(`#modules .module-item label[keywords*="${v}" i],[module*="${v}" i],[desc*="${v}" i]`), function(e) {
          e.style.display = 'block';
        });
      } else {
        Array.prototype.forEach.call(document.querySelectorAll('#modules .module-item label'), function(e) {
          e.style.display = 'block';
        });
      }
    };
  });
};
