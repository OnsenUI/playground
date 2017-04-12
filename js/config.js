/* global app */
app.config = {};

app.config.platform = 'ios';
app.config.codeType = 'javascript';
app.config.cdn = 'https://unpkg.com/';
app.config.ci = 'https://circleci.com/api/v1/project/OnsenUI/OnsenUI/latest/artifacts/0/$CIRCLE_ARTIFACTS/';
app.config.nightly = window.sessionStorage.getItem('nightly') === 'true';

// Enables local lib versions
if ((window.location.hostname === 'localhost' || window.location.hostname.match(/[0-9.]+/)) && window.location.pathname.indexOf('/tutorial/') === 0) {
  app.config.local = true;
}

app.config.getCdnUrl = function(lib, path, forceRemote, skipNightly) {
  // Fetch from local disk
  if (app.config.local === true && !forceRemote) {
    let directory = '../../OnsenUI/';
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

app.config.ownLibs = ['onsenui', 'react-onsenui', 'angular2-onsenui', 'vue-onsenui'];
app.config.extLibs = ['react', 'angular1', 'angular2', 'vue'];
app.config.defaultVersions = {
  react: '15.4.2',
  angular1: '1.5.5',
  angular2: '2.0.0',
  vue: '2.2.4'
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
      angularOnsenui: app.config.getCdnUrl('onsenui', 'js/angular-onsenui.js', forceRemote),
      // React
      react: `https://cdnjs.cloudflare.com/ajax/libs/react/${app.config.versions.react}/react.min.js`,
      reactDom: `https://cdnjs.cloudflare.com/ajax/libs/react/${app.config.versions.react}/react-dom.min.js`,
      reactOnsenui: app.config.getCdnUrl('react-onsenui', 'dist/react-onsenui.js', forceRemote),
      // Vue
      vue: `https://cdnjs.cloudflare.com/ajax/libs/vue/${app.config.versions.vue}/vue.js`,
      vueOnsenui: app.config.getCdnUrl('vue-onsenui', 'dist/vue-onsenui.js', forceRemote),
      // Angular 2
      zone: `https://unpkg.com/zone.js@0.6.21/dist/zone.min.js`,
      corejs: `https://unpkg.com/core-js@2.4.1/client/core.min.js`,
      systemjs: `https://unpkg.com/systemjs@0.19.37/dist/system.js`
    },
    css: {
      onsenui: app.config.getCdnUrl('onsenui', 'css/onsenui.css', forceRemote, true),
      onsenuiCssComponents: app.config.getCdnUrl('onsenui', 'css/onsen-css-components.css', forceRemote)
    }
  };
};

app.config.transpilerLib = {
  'babel': "https://unpkg.com/babel-standalone/babel.min.js",
  'typescript': "https://cdnjs.cloudflare.com/ajax/libs/typescript/2.2.0/typescript.min.js"
};

