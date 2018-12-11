// Onsen UI SystemJS config
(function() {

var ngxonsenui = '';

if (window._isLocalDev) {
  ngxonsenui = '../../OnsenUI/bindings/angular2/dist';
} else if (window._onsNightlyBuild) {
  ngxonsenui = 'https://crossorigin.me/https://circleci.com/api/v1/project/OnsenUI/OnsenUI/latest/artifacts/0/$CIRCLE_ARTIFACTS/angular2-onsenui';
} else {
  ngxonsenui = 'https://unpkg.com/ngx-onsenui' + (window._ngxOnsLibVersion ? ('@' + window._ngxOnsLibVersion) : '');
}

var libVersion = window._ngxLibVersion ? ('@' + window._ngxLibVersion) : '';

// Adapter modules for `ons` object
System.registerDynamic('onsenui', [], false, function(require, exports, module) {
  module.exports = window.ons;
});

System.config({
  map: {
    'ngx-onsenui': ngxonsenui + '/bundles/ngx-onsenui.umd.js' + (window._onsNightlyBuild ? '?branch=master&filter=successful' : ''),
    '@angular/core': `https://unpkg.com/@angular/core${libVersion}/bundles/core.umd.min.js`,
    '@angular/compiler': `https://unpkg.com/@angular/compiler${libVersion}/bundles/compiler.umd.min.js`,
    '@angular/common': `https://unpkg.com/@angular/common${libVersion}/bundles/common.umd.min.js`,
    '@angular/forms': `https://unpkg.com/@angular/forms${libVersion}/bundles/forms.umd.min.js`,
    '@angular/platform-browser': `https://unpkg.com/@angular/platform-browser${libVersion}/bundles/platform-browser.umd.min.js`,
    '@angular/platform-browser-dynamic': `https://unpkg.com/@angular/platform-browser-dynamic${libVersion}/bundles/platform-browser-dynamic.umd.min.js`,
    'rxjs': 'https://unpkg.com/rxjs@6.3.3',
    'process': 'https://unpkg.com/process@0.11.9'
  },
  packages: {
    'ngx-onsenui': {
      format: 'cjs',
    },
    'core-js': {
      main: 'index.js',
      format: 'cjs'
    },
    'rxjs': {
      main: 'index.js',
      defaultExtension: 'js'
    },
    'rxjs/operators': {
      main: 'index.js',
      defaultExtension: 'js'
    },
    'app': {
      defaultExtension: 'ts',
      format: 'esm'
    }
  },
  meta: {
    'inline': {
      loader: 'inline-loader'
    }
  },
  transpiler: 'typescript',
  typescriptOptions: {
    'emitDecoratorMetadata': true
  }
});

System.amdDefine('inline-loader', [], function() {
  return {
    fetch: function() {
      return new Promise(function(resolve, reject) {
        if (document.readyState === 'complete') {
          load();
        } else {
          window.onload = load;
        }

        function load() {
          var target = document.querySelector('script[type="text/typescript"]');

          if (target) {
            resolve(target.textContent);
          } else {
            reject('Error: inline-loader fail.');
          }
        }
      });
    }
  };
});

System.import('inline');
}())
