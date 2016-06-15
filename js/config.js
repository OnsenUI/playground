app.config = {};

app.config.platform = 'ios';
app.config.framework = window.sessionStorage.getItem('ons-framework') || 'vanilla';
app.config.cdn = 'rawgit';
app.config.cdnURL = {
  npm: 'https://npmcdn.com',
  rawgit: 'https://cdn.rawgit.com'
};

app.config.vSep = {
  npm: '@',
  rawgit: '/'
};

app.config.repos = {
  npm: {
    onsenui: 'onsenui',
    reactOnsenui: 'react-onsenui',
    angular2Onsenui: 'angular2-onsenui'
  },
  rawgit: {
    onsenui: 'OnsenUI/OnsenUI-dist',
    reactOnsenui: 'OnsenUI/react-onsenui'
  }
};

app.config.versions = {
  defaults: {
    onsenui: '2.0.0-rc.10',
    reactOnsenui: '0.4.1'
  },
  onsenui: window.sessionStorage.getItem('onsenui-version'),
  reactOnsenui: window.sessionStorage.getItem('react-onsenui-version')
};

if (app.config.cdn === 'rawgit') {
  app.config.ready = Promise.all(function() {
    var setDefault = function(libName) {
      console.warn('Could not fetch ' + app.util.toDash(libName) + '.js version. Github\'s API rate limit exceeded.');
      app.config.versions[libName] = app.config.versions.defaults[libName];
    };

    var lastVersionOf = function(libName) {
      return app.util.request(`https://api.github.com/repos/${app.config.repos[app.config.cdn][libName]}/releases/latest`)
        .then(function(res) {
          var response = JSON.parse(res);
          if (response.tag_name) {
            app.config.versions[libName] = response.tag_name;
            window.sessionStorage.setItem(app.util.toDash(libName) + '-version', response.tag_name);
          } else {
            setDefault(libName);
          }
        })
        .catch(function(err) {
          console.error(err.message);
          setDefault(libName);
        });
    };

    var promises = [];
    Object.keys(app.config.versions.defaults).forEach(function(libName) {
      var promise = (!app.config.versions[libName]) ? lastVersionOf(libName) : Promise.resolve();

      promise.then(function() {
        console.info('Using ' + app.util.toDash(libName) + '.js', app.config.versions[libName]);
      });

      promises.push(promise);
    });

    return promises;
  }());
} else if (app.config.cdn === 'npm') {
  app.config.ready = Promise.resolve();
  Object.keys(app.config.versions.defaults).forEach(function(libName) {
    if (app.config.versions[libName]) {
      console.info(`Using ${app.util.toDash(libName)}.js ${app.config.versions[libName]}`);
    } else {
      console.info(`Using latest version of ${app.util.toDash(libName)}.js`);
    }
  });
}

app.config.ready.then(function() {
  app.config.lib = {
    remote: {
      js: {
        onsenui: `${app.config.cdnURL[app.config.cdn]}/${app.config.repos[app.config.cdn].onsenui}${(app.config.versions.onsenui ? (app.config.vSep[app.config.cdn] + app.config.versions.onsenui) : '')}/js/onsenui.js`,
        angular: 'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.5/angular.min.js',
        angularOnsenui: `${app.config.cdnURL[app.config.cdn]}/${app.config.repos[app.config.cdn].onsenui}${(app.config.versions.onsenui ? (app.config.vSep[app.config.cdn] + app.config.versions.onsenui) : '')}/js/angular-onsenui.js`,
        angular2: 'https://cdnjs.cloudflare.com/ajax/libs/angular.js/2.0.0-beta.17/angular2.js',
        angular2Onsenui: `${app.config.cdnURL[app.config.cdn]}/${app.config.repos[app.config.cdn].angular2Onsenui}${(app.config.versions.angular2Onsenui ? (app.config.vSep[app.config.cdn] + app.config.versions.angular2Onsenui) : '')}/src/angular2-onsenui.js`,
        react: 'https://cdnjs.cloudflare.com/ajax/libs/react/15.1.0/react.js',
        reactDom: 'https://cdnjs.cloudflare.com/ajax/libs/react/15.1.0/react-dom.js',
        reactOnsenui: `${app.config.cdnURL[app.config.cdn]}/${app.config.repos[app.config.cdn].reactOnsenui}${(app.config.versions.reactOnsenui ? (app.config.vSep[app.config.cdn] + app.config.versions.reactOnsenui) : '')}/dist/react-onsenui.js`
      },
      css: {
        onsenui: `${app.config.cdnURL[app.config.cdn]}/${app.config.repos[app.config.cdn].onsenui}${(app.config.versions.onsenui ? (app.config.vSep[app.config.cdn] + app.config.versions.onsenui) : '')}/css/onsenui.css`,
        onsenuiCssComponents: `${app.config.cdnURL[app.config.cdn]}/${app.config.repos[app.config.cdn].onsenui}${(app.config.versions.onsenui ? (app.config.vSep[app.config.cdn] + app.config.versions.onsenui) : '')}/css/onsen-css-components.css`
      }
    },

    local: {
      js: {
        onsenui: 'onsen/js/onsenui.js',
        angular: 'angular/angular.min.js',
        angularOnsenui: 'onsen/js/angular-onsenui.js',
        angular2: 'angular2/angular2.min.js',
        angular2Onsenui: 'onsen/js/angular2-onsenui.js',
        react: 'react/react.min.js',
        reactDom: 'react/react-dom.min.js',
        reactOnsenui: `react-onsenui/react-onsenui.js`
      },
      css: {
        onsenui: `onsen/css/onsenui.css`,
        onsenuiCssComponents: `onsen/css/onsen-css-components.css`
      }
    }
  };

  var pref = function(o, k) { o[k] = 'lib/' + o[k]; };
  var js = app.config.lib.local.js, css = app.config.lib.local.css;
  Object.keys(js).forEach(pref.bind(null, js));
  Object.keys(css).forEach(pref.bind(null, css));


  app.config.npm = {
    onsenui: ['"onsenui": "' + app.config.versions.onsenui + '"'],
    angular: ['"angular": ""'],
    angular2: ['"angular2": ""', '"angular2-onsenui": ""'],
    typescript: ['"typescript": ""'],
    react: ['"react": ""', '"react-dom": ""', '"react-onsenui": ""'],
    babel: ['"babel-cli": ""', '"babel-preset-react": ""']
  };
});
