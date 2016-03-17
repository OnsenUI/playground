app.modules = {'Navigation Components': ['navigator', 'tabbar']};

app.modulesSetup = function() {
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

	app.selectList.onchange = app.changeModule;

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

app.changeModule = function(event) {
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

	var element = event.target;
	var lesson = element.options[element.selectedIndex].label;
	var module = element.options[element.selectedIndex].parentElement.label;

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

		app.editors.html.setValue('\n' + html, -1);
		app.editors.js.setValue('\n' + js, -1);

		document.getElementById('pages-current').innerHTML = app.tutorial.pageIndex + 1;
		document.getElementById('pages-total').innerHTML = app.tutorial.pages.length;
		document.getElementById('tutorial-content').innerHTML = app.tutorial.pages[0];

    app.runProject();
	};

	request.open('get', `./tutorial/${module}/${lesson}.html`);
	request.send();
};
