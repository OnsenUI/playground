app.config = {};

app.config.platform = 'ios';
app.config.cdn = 'https://unpkg.com';

app.config.ownLibs = ['onsenui', 'react-onsenui', 'angular2-onsenui'];
app.config.extLibs = ['react', 'angular2'];

app.config.versions = {};
(app.config.ownLibs.concat(app.config.extLibs)).forEach(function(key) {
  app.config.versions[key] = window.sessionStorage.getItem(key + '-version');
});

app.config.ownLibs.forEach(function (libName) {
  if (app.config.versions[libName]) {
    console.info(`Using ${libName}.js ${app.config.versions[libName]}`);
  } else {
    console.info(`Using latest version of ${libName}.js`);
  }
});

app.config.lib = {
  remote: {
    js: {
      // Vanilla
      onsenui: `${app.config.cdn}/onsenui${(app.config.versions.onsenui ? ('@' + app.config.versions.onsenui) : '')}/js/onsenui.js`,
      // AngularJS
      angular1: 'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.5/angular.min.js',
      angularOnsenui: `${app.config.cdn}/onsenui${(app.config.versions.onsenui ? ('@' + app.config.versions.onsenui) : '')}/js/angular-onsenui.js`,
      // React
      react: 'https://cdnjs.cloudflare.com/ajax/libs/react/15.1.0/react.min.js',
      reactDom: 'https://cdnjs.cloudflare.com/ajax/libs/react/15.1.0/react-dom.min.js',
      reactOnsenui: `${app.config.cdn}/react-onsenui${(app.config.versions.reactOnsenui ? ('@' + app.config.versions.reactOnsenui) : '')}/dist/react-onsenui.js`,
      // Angular 2
      zone: `https://unpkg.com/zone.js@0.6.21/dist/zone.min.js`,
      corejs: `https://unpkg.com/core-js@2.4.1/client/core.min.js`,
      systemjs: `https://unpkg.com/systemjs@0.19.37/dist/system.js`
    },
    css: {
      onsenui: `${app.config.cdn}/onsenui${(app.config.versions.onsenui ? ('@' + app.config.versions.onsenui) : '')}/css/onsenui.css`,
      onsenuiCssComponents: `${app.config.cdn}/onsenui${(app.config.versions.onsenui ? ('@' + app.config.versions.onsenui) : '')}/css/onsen-css-components.css`
    }
  },

  local: {
    js: {
      onsenui: 'onsen/js/onsenui.js',
      angular1: 'angular/angular.min.js',
      angularOnsenui: 'onsen/js/angular-onsenui.js',
      system: 'system/system.js',
      angular2: 'angular2/angular2.min.js',
      angular2Onsenui: 'angular2-onsenui/angular2-onsenui.js',
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

var pref = function (o, k) { o[k] = 'lib/' + o[k]; };
var js = app.config.lib.local.js,
  css = app.config.lib.local.css;
Object.keys(js).forEach(pref.bind(null, js));
Object.keys(css).forEach(pref.bind(null, css));

app.config.npm = {
  onsenui: ['"onsenui": "' + app.config.versions.onsenui + '"'],
  angular1: ['"angular": ""'],
  angular2: ['"angular2": ""', '"angular2-onsenui": ""'],
  typescript: ['"typescript": ""'],
  react: ['"react": ""', '"react-dom": ""', '"react-onsenui": ""'],
  babel: ['"babel-cli": ""', '"babel-preset-react": ""']
};


