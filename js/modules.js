app.modules = {};

app.modules.hash = {'Navigation Components': ['navigator', 'tabbar']};

app.modules.setup = function() {
	app.selectList = document.body.querySelector('#module-list select');
	Object.keys(app.modules.hash).forEach(function(module) {
		var optgroup = document.createElement('optgroup');
		optgroup.setAttribute('label', module);
		app.modules.hash[module].forEach(function(lesson) {
			var option = document.createElement('option');
			option.innerHTML = lesson;
			optgroup.appendChild(option)
		});
		app.selectList.appendChild(optgroup);
	});

	app.selectList.onchange = function() {
		app.modules.change().then(app.runProject);
	};
};

app.modules.change = function(module, part) {
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
		}, '', '?module=' + module.replace(' ', '+') + '&part=' + part.replace(' ', '+'));
	} else {
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

		request.open('get', `./tutorial/${module}/${part}.html`);
		request.send();
	});
};
