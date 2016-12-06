app.setup = {};

app.setup.splitPanes = function () {
  if (!app.config.compact) { // Full View
    Split(['#leftPane', '#rightPane'], {
      gutterSize: 15,
      sizes: [35, 65],
      minSize: 301,
      cursor: 'col-resize',
      onDrag: app.util.resize.editorResize
    });

    Split(['#leftTopPane', '#leftBottomPane'], {
      direction: 'vertical',
      sizes: [40, 60],
      minSize: [9, 9],
      gutterSize: 15,
      cursor: 'row-resize'
    });

    document.querySelector('#leftPane').style.width = 'calc(35% - 7.5px)';
    document.querySelector('#rightPane').style.width = 'calc(65% - 7.5px)';

  } else { // Compact View
    app.config.showDocs = app.util.getParam('docs') !== 'false';
    if (app.config.showDocs) {
      Split(['#leftPane', '#centerPane', '#rightPane'], {
        gutterSize: 15,
        sizes: [25, 25, 50],
        minSize: [9, 310, 200],
        cursor: 'col-resize',
        onDrag: app.util.resize.editorResize
      });

      document.querySelector('#leftPane').style.width = 'calc(20% - 10px)';
      document.querySelector('#centerPane').style.width = 'calc(25% - 10px)';
      document.querySelector('#rightPane').style.width = 'calc(55% - 10px)';
    } else {
      Split(['#centerPane', '#rightPane'], {
        gutterSize: 15,
        sizes: [20, 80],
        minSize: [300, 9],
        cursor: 'col-resize',
        onDrag: app.util.resize.editorResize
      });

      document.querySelector('#leftPane').style.display = 'none';
      document.querySelector('#centerPane').style.width = 'calc(20% - 7.5px)';
      document.querySelector('#rightPane').style.width = 'calc(80% - 7.5px)';
    }
  }

  Split(['#rightTopPane', '#rightBottomPane'], {
    direction: 'vertical',
    sizes: [50, 50],
    minSize: [9, 9],
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
  editor.renderer.setShowGutter(window.Split);
  editor.container.style.lineHeight = 1.3;
  editor.$blockScrolling = Infinity;
  editor.commands.removeCommand('find');
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

  var mainViewLink = document.querySelector('.main-view-link a');
  mainViewLink.setAttribute('href', window.location.href.replace('/embed.html', '/index.html'));
};

app.setup.toolbar = function () {
  document.querySelector('#codepen-form').onsubmit = app.services.codepenSubmit;
  document.querySelector('#modify-button').onclick = app.services.modifySource;
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
          moduleItem.innerHTML = `
            <input type="radio" name="select-item" id="${id}">
            <label for="${id}" module="${module}" desc="${app.modules[framework][category][module]}"></label>
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
  });
};
