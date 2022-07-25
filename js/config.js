/* global app */
app.config = {};

app.config.platform = 'ios';
app.config.codeType = 'javascript';
app.config.cdn = 'https://unpkg.com/';
app.config.ci = 'https://circleci.com/api/v1/project/OnsenUI/OnsenUI/latest/artifacts/0/$CIRCLE_ARTIFACTS/';
app.config.nightly = window.sessionStorage.getItem('nightly') === 'true';

app.config.lang = app.util.getParam('lang') || ((window.location.hostname.split('.')[0] === 'ja') ? 'ja' : null);
if (app.config.lang) {
  document.documentElement.classList.add('i18n-' + app.config.lang);
}

// Enables local lib versions
if ((window.location.hostname === 'localhost' || !window.location.hostname.match(/[a-zA-Z]/)) && window.location.pathname.indexOf('/playground/') === 0) {
  app.config.local = true;
}

app.config.getCdnUrl = function(lib, path, forceRemote, skipNightly) {
  // Fetch from local disk
  if (app.config.local === true && !forceRemote) {
    var directory = '../../OnsenUI/';
    if (lib === 'onsenui') {
      directory += 'build/';
    } else {
      directory += `bindings/${lib.split('-')[0]}/`;
    }

    return directory + path;
  }

  // Fetch from remote CDN

  // CORS browser issue with fonts from the same server
  if (skipNightly) {
    return `${app.config.cdn}${lib}${!app.config.versions.onsenui || app.config.nightly ? '' : ('@' + app.config.versions.onsenui)}/${path}`;
  }

  var url = app.config.nightly ? app.config.ci : app.config.cdn;
  url += `${lib}${(app.config.versions[lib] && !app.config.nightly ? ('@' + app.config.versions[lib]) : '')}/${path}`;

  if (app.config.nightly) {
    url += '?branch=master&filter=successful';
  }
  return url;
};

app.config.ownLibs = ['onsenui', 'react-onsenui', 'ngx-onsenui', 'vue-onsenui'];
app.config.extLibs = ['react', 'angular1', 'angular2', 'vue'];
app.config.defaultVersions = {
  react: '18.2.0',
  angular1: '1.5.5',
  angular2: '7.1.0',
  vue: '2.4.1'
};

app.config.versions = {};
(app.config.ownLibs.concat(app.config.extLibs)).forEach(function(key) {
  app.config.versions[key] = window.sessionStorage.getItem(key + '-version') || app.config.defaultVersions[key];
});

app.config.ownLibs.forEach(function (libName) {
  if (app.config.local) {
    console.info(`Using local version of ${libName}.js`);
  } else if (app.config.nightly) {
    console.info(`Using ${libName}.js nightly build`);
  } else if (app.config.versions[libName]) {
    console.info(`Using ${libName}.js ${app.config.versions[libName]}`);
  } else {
    console.info(`Using latest release of ${libName}.js`);
  }
});

app.config.lib = function(forceRemote) {
  return {
    js: {
      // Vanilla
      onsenui: app.config.getCdnUrl('onsenui', 'js/onsenui.js', forceRemote),
      // AngularJS
      angular1: `https://cdnjs.cloudflare.com/ajax/libs/angular.js/${app.config.versions.angular1}/angular.min.js`,
      angularOnsenui: app.config.getCdnUrl('angularjs-onsenui', 'dist/angularjs-onsenui.js', forceRemote),
      // React
      react: `https://cdnjs.cloudflare.com/ajax/libs/react/${app.config.versions.react}/umd/react.production.min.js`,
      reactDom: `https://cdnjs.cloudflare.com/ajax/libs/react-dom/${app.config.versions.react}/umd/react-dom.production.min.js`,
      propTypes: `https://cdnjs.cloudflare.com/ajax/libs/prop-types/15.8.1/prop-types.min.js`,
      reactOnsenui: app.config.getCdnUrl('react-onsenui', 'dist/react-onsenui.js', forceRemote),
      // Vue
      vue: `https://cdnjs.cloudflare.com/ajax/libs/vue/${app.config.versions.vue}/vue.js`,
      vueOnsenui: app.config.getCdnUrl('vue-onsenui', 'dist/vue-onsenui.js', forceRemote),
      // Angular 2+
      zone: 'https://cdnjs.cloudflare.com/ajax/libs/zone.js/0.8.26/zone.min.js',
      corejs: 'https://cdnjs.cloudflare.com/ajax/libs/core-js/2.5.4/core.min.js',
      systemjs: 'https://cdnjs.cloudflare.com/ajax/libs/systemjs/0.19.47/system.js' // 0.20.18 caused `Fetch error: 404 Not Found`
    },
    css: {
      onsenui: app.config.getCdnUrl('onsenui', 'css/onsenui.css', forceRemote, true),
      onsenuiCssComponents: app.config.getCdnUrl('onsenui', 'css/onsen-css-components.css', forceRemote)
    }
  };
};

app.config.transpilerLib = {
  'babel': "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.26.0/babel.min.js",
  'typescript': "https://cdnjs.cloudflare.com/ajax/libs/typescript/2.5.2/typescript.min.js"
};

