app.config = {};

app.config.platform = 'ios';
app.config.codeType = 'javascript';
app.config.cdn = 'https://unpkg.com';
app.config.ci = 'https://circleci.com/api/v1/project/OnsenUI/OnsenUI/latest/artifacts/0/$CIRCLE_ARTIFACTS/';

app.config.ownLibs = ['onsenui', 'react-onsenui'];
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
console.info('Using latest version of angular2-onsenui.js'); // Version provided in onsenui.system.js

app.config.lib = {
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
};

