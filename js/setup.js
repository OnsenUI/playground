app.setup = {};

app.setup.splitPanes = function() {
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
};

app.setup.toolbar = function() {
  document.querySelector('#skin').onclick = app.services.toggleTheme;
};

app.setup.modules = function() {
  app.selectList = document.body.querySelector('#module-list select');
  Object.keys(app.modules).forEach(function(module) {
    var optgroup = document.createElement('optgroup');
    optgroup.setAttribute('label', module);
    app.modules[module].forEach(function(lesson) {
      var option = document.createElement('option');
      option.innerHTML = lesson;
      optgroup.appendChild(option)
    });
    app.selectList.appendChild(optgroup);
  });

  app.selectList.onchange = function() {
    app.services.changeModule().then(app.services.runProject);
  };
};