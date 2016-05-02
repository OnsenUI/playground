app.setup = {};

app.setup.splitPanes = function() {
  Split(['#leftPane', '#rightPane'], {
    gutterSize: 15,
    sizes: [30, 70],
    minSize: 300,
    cursor: 'col-resize',
    onDrag: app.util.resize.handler
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

app.setup.editor = function(id, language) {
    var editor = ace.edit(id);
    editor.setTheme('ace/theme/' + (document.body.classList.contains('dark-skin') ? 'monokai' : 'chrome'));
    editor.session.setMode("ace/mode/" + language);
    editor.session.setTabSize(2);
    editor.session.setUseSoftTabs(true);
    editor.renderer.setShowGutter(window.Split);
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

app.setup.pagesCounter  = function() {
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

app.setup.tabView = function() {
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

  var mainViewLink = document.querySelector('.main-view-link a');
  mainViewLink.setAttribute('href', window.location.href.replace('/embed.html', '/index.html'));
};

app.setup.toolbar = function() {
  document.querySelector('#download-button').onclick = app.services.showGenerateModal;
  document.querySelector('#modal-generate-button').onclick = app.services.generateCordovaProject;
  document.querySelector('#modal-cancel-button').onclick = app.services.hideGenerateModal;
  document.querySelector('#modal-mask').onclick = app.services.hideGenerateModal;
  document.querySelector('#codepen-form').onsubmit = app.services.codepenSubmit;
};

app.setup.modules = function() {
  var frameworkItems = Array.prototype.slice.call(document.body.querySelectorAll('.framework-item'));

  frameworkItems.forEach(function(frameworkItem) {
    var framework = frameworkItem.querySelector('label').getAttribute('framework');
    var moduleList = frameworkItem.querySelector('.module-list');

    if(app.modules.hasOwnProperty(framework)) {
      Object.keys(app.modules[framework]).forEach(function(category, index) {
        var id = `c-${framework}-${app.util.parseId(category)}`;
        var categoryItem = document.createElement('li');
        categoryItem.classList.add('category-item');

        categoryItem.innerHTML = `
          <input type="checkbox" id="${id}" ${index === 0 ? 'checked': ''}>
          <label for="${id}" category="${category}"></label>
        `;

        var listElement = document.createElement('ul');

        Object.keys(app.modules[framework][category]).forEach(function(module) {
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
    }

    document.body.querySelector('#modules').onchange = function(event) {
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